export type ClosetMilestoneId = "first-outfit" | "daily-styling" | "wardrobe-gaps" | "closet-intelligence";

export interface ClosetMilestone {
  id: ClosetMilestoneId;
  count: number;
  title: string;
  unlockedTitle: string;
}

export interface ClosetMilestoneStatus {
  pieceCount: number;
  next: ClosetMilestone | null;
  latest: ClosetMilestone | null;
  target: ClosetMilestone;
  remaining: number;
  progress: number;
  progressLabel: string;
  headline: string;
  body: string;
  uploadRead: string;
  emptyState: string;
}

export const CLOSET_MILESTONES: ClosetMilestone[] = [
  { id: "first-outfit", count: 5, title: "First outfit", unlockedTitle: "First outfit unlocked" },
  { id: "daily-styling", count: 10, title: "Daily styling", unlockedTitle: "Daily styling unlocked" },
  { id: "wardrobe-gaps", count: 20, title: "Wardrobe gaps", unlockedTitle: "Wardrobe gaps unlocked" },
  { id: "closet-intelligence", count: 30, title: "Closet intelligence", unlockedTitle: "Closet intelligence unlocked" },
];

function pluralizePieces(count: number) {
  return `${count} ${count === 1 ? "piece" : "pieces"}`;
}

export function getClosetMilestoneStatus(pieceCount: number): ClosetMilestoneStatus {
  const safeCount = Math.max(0, pieceCount);
  const next = CLOSET_MILESTONES.find((milestone) => safeCount < milestone.count) ?? null;
  const latest = [...CLOSET_MILESTONES].reverse().find((milestone) => safeCount >= milestone.count) ?? null;
  const target = next ?? CLOSET_MILESTONES[CLOSET_MILESTONES.length - 1];
  const remaining = next ? Math.max(0, next.count - safeCount) : 0;
  const progress = next ? Math.min(100, Math.round((safeCount / next.count) * 100)) : 100;
  const progressLabel = next ? `${safeCount}/${next.count}` : `${safeCount}+`;

  if (!next) {
    return {
      pieceCount: safeCount,
      next,
      latest,
      target,
      remaining,
      progress,
      progressLabel,
      headline: "Closet intelligence unlocked",
      body: "Iris has enough range to spot outfit patterns, gaps, repeats, and stronger rotations.",
      uploadRead: "Closet intelligence is live. Iris can now give deeper reads on gaps, repeats, and outfit rotation.",
      emptyState: "Add closet pieces and Iris will start building real outfits from what you own.",
    };
  }

  if (!latest) {
    return {
      pieceCount: safeCount,
      next,
      latest,
      target,
      remaining,
      progress,
      progressLabel,
      headline: `${pluralizePieces(remaining)} to ${next.title.toLowerCase()}`,
      body: "Add real pieces you actually wear. At 5 pieces, Iris can build your first personal outfit.",
      uploadRead: `${pluralizePieces(remaining)} until Iris can build your first personal outfit.`,
      emptyState: "Add 5 real closet pieces to unlock your first Iris-built outfit.",
    };
  }

  const nextCopy: Record<ClosetMilestoneId, string> = {
    "first-outfit": "Add a few real pieces and Iris can build your first personal outfit.",
    "daily-styling": "Your first outfit is unlocked. Add more range for stronger daily suggestions.",
    "wardrobe-gaps": "Daily styling is unlocked. Add more range so Iris can spot wardrobe gaps.",
    "closet-intelligence": "Gap reads are unlocked. Add more range for deeper closet intelligence.",
  };

  return {
    pieceCount: safeCount,
    next,
    latest,
    target,
    remaining,
    progress,
    progressLabel,
    headline: latest.unlockedTitle,
    body: nextCopy[next.id],
    uploadRead: `${latest.unlockedTitle}. ${pluralizePieces(remaining)} until ${next.title.toLowerCase()}.`,
    emptyState: "Add closet pieces and Iris will start building real outfits from what you own.",
  };
}
