# Changelog

## Unreleased - Phase 5: Wardrobe Persistence Hardening

- Added authenticated item-level create, update, and delete wardrobe operations
- Preserved the legacy bulk wardrobe save payload and existing stored array format
- Wardrobe changes now appear locally only after the server confirms persistence
- Added saving, deleting, load-error, and mutation-error feedback
- Prevented duplicate mutation submissions while a request is in progress
- Image data remains in the existing persisted thumbnail format; no storage migration is included
- Saved outfits now sync per authenticated user, with one-time import from existing device-local outfits
- Device-local saved outfits remain available as a fallback when server sync is unavailable

## v0.1.0 - Initial Production Release

IRYS v0.1.0 is the first production release of the AI personal styling app.

### Features

- User authentication
- Google OAuth
- Email/password login
- Profile persistence
- AI stylist chat
- Iris memory
- Wardrobe catalog
- Persistent wardrobe images
- Multi-user wardrobe separation
- Responsive mobile UI
- Supabase backend
- Vercel production deployment

### Known Limitations

- No delete wardrobe item action yet
- No edit wardrobe item action yet
- No item detail view yet
- Wardrobe items currently support one uploaded image per item
- Brand details may need manual correction by the user
- Fit details may need manual correction by the user
- Example: an uploaded item may be identified as relaxed fit when it is actually slim fit
- Supabase Storage migration is planned for production-ready image handling

### Next Wardrobe Priorities

- Add edit wardrobe item support for correcting name, brand, category, color, fit, tags, and notes
- Add delete wardrobe item support with confirmation
- Add item detail view for richer metadata and styling recommendations
- Add multiple photos per wardrobe item
- Move wardrobe images from persisted thumbnails to Supabase Storage
