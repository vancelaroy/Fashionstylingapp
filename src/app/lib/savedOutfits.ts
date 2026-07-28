import { projectId } from "/utils/supabase/info";

const SERVER = `https://${projectId}.supabase.co/functions/v1/irys-api`;

export type OutfitSlotKey = "top" | "bottom" | "outer" | "shoes" | "bag" | "accessory";

export interface SavedOutfit {
  id: string;
  name: string;
  slotItemIds: Partial<Record<OutfitSlotKey, string>>;
  createdAt: string;
}

const SLOT_ORDER: OutfitSlotKey[] = ["top", "bottom", "outer", "shoes", "bag", "accessory"];

function signatureFor(outfit: SavedOutfit) {
  return SLOT_ORDER.map((slot) => `${slot}:${outfit.slotItemIds?.[slot] ?? ""}`).join("|");
}

function normalizeOutfits(value: unknown): SavedOutfit[] {
  if (!Array.isArray(value)) return [];
  return value.filter((outfit): outfit is SavedOutfit => (
    typeof outfit === "object" &&
    outfit !== null &&
    typeof (outfit as SavedOutfit).id === "string" &&
    typeof (outfit as SavedOutfit).name === "string" &&
    typeof (outfit as SavedOutfit).slotItemIds === "object" &&
    typeof (outfit as SavedOutfit).createdAt === "string"
  ));
}

export function readLocalSavedOutfits(savedOutfitsKey: string): SavedOutfit[] {
  try {
    return normalizeOutfits(JSON.parse(window.localStorage.getItem(savedOutfitsKey) ?? "[]"));
  } catch {
    return [];
  }
}

export function writeLocalSavedOutfits(savedOutfitsKey: string, outfits: SavedOutfit[]) {
  window.localStorage.setItem(savedOutfitsKey, JSON.stringify(outfits));
  window.dispatchEvent(new CustomEvent("irys:savedOutfitsChanged", { detail: { savedOutfitsKey } }));
}

function backupLocalSavedOutfits(savedOutfitsKey: string, outfits: SavedOutfit[]) {
  if (outfits.length === 0) return;
  const backupKey = `${savedOutfitsKey}.backup`;
  if (!window.localStorage.getItem(backupKey)) {
    window.localStorage.setItem(backupKey, JSON.stringify({
      backedUpAt: new Date().toISOString(),
      outfits,
    }));
  }
}

export function mergeSavedOutfits(primary: SavedOutfit[], secondary: SavedOutfit[]) {
  const seen = new Set<string>();
  const merged: SavedOutfit[] = [];

  [...primary, ...secondary].forEach((outfit) => {
    const idKey = outfit.id;
    const signature = signatureFor(outfit);
    if (seen.has(idKey) || seen.has(signature)) return;
    seen.add(idKey);
    seen.add(signature);
    merged.push(outfit);
  });

  return merged.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function fetchServerSavedOutfits(accessToken?: string | null): Promise<SavedOutfit[] | null> {
  if (!accessToken) return null;
  const response = await fetch(`${SERVER}/outfits`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  const data = await response.json();
  return normalizeOutfits(data.outfits);
}

export async function saveServerSavedOutfits(accessToken: string | null | undefined, outfits: SavedOutfit[]) {
  if (!accessToken) return false;
  const response = await fetch(`${SERVER}/outfits`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ outfits }),
  });
  return response.ok;
}

export async function loadSavedOutfits(accessToken: string | null | undefined, savedOutfitsKey: string) {
  const localOutfits = readLocalSavedOutfits(savedOutfitsKey);
  backupLocalSavedOutfits(savedOutfitsKey, localOutfits);

  if (!accessToken) return localOutfits;

  try {
    const serverOutfits = await fetchServerSavedOutfits(accessToken);
    if (!serverOutfits) return localOutfits;

    const merged = mergeSavedOutfits(serverOutfits, localOutfits);
    writeLocalSavedOutfits(savedOutfitsKey, merged);

    if (merged.length !== serverOutfits.length || merged.some((outfit, index) => outfit.id !== serverOutfits[index]?.id)) {
      await saveServerSavedOutfits(accessToken, merged);
    }

    return merged;
  } catch {
    return localOutfits;
  }
}

export async function persistSavedOutfits(accessToken: string | null | undefined, savedOutfitsKey: string, outfits: SavedOutfit[]) {
  writeLocalSavedOutfits(savedOutfitsKey, outfits);
  try {
    await saveServerSavedOutfits(accessToken, outfits);
  } catch {
    // Local backup remains available if the network or Edge Function is temporarily unavailable.
  }
}
