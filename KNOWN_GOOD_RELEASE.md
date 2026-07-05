# IRYS Known Good Release Checklist

## Release Date
July 5, 2026

## Production URL
https://www.irysstyle.com

## Core Status
- [x] Frontend live on Vercel
- [x] Supabase Edge Function live
- [x] Google OAuth working
- [x] Email/password auth working
- [x] Session loop resolved
- [x] Profile saves and loads
- [x] Wardrobe upload/save works

## Fresh User QA
- [ ] Open site in incognito/private window
- [ ] Create new account
- [ ] Complete Style Discovery/Profile setup
- [ ] Upload or save wardrobe item
- [ ] Open Iris chat
- [ ] Confirm Iris can respond
- [ ] Sign out
- [ ] Sign back in
- [ ] Confirm profile data persists
- [ ] Confirm wardrobe data persists

## Returning User QA
- [ ] Open site normally
- [ ] Sign in with existing account
- [ ] Confirm session loads correctly
- [ ] Confirm profile loads
- [ ] Confirm wardrobe items load
- [ ] Confirm Iris chat/history loads
- [ ] Sign out and sign back in successfully

## Known Good Release Notes
This release confirms IRYS has a working production foundation: authentication, profile persistence, wardrobe saving, backend functions, and live deployment.

## Next Priority
Polish Iris wardrobe-aware recommendations so she can reference saved closet items naturally.
