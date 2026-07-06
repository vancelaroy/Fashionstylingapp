# IRYS Known Good Release

## v0.1.0

IRYS v0.1.0 is working in production.

### Production Capabilities

- Users can create accounts and sign in
- Google OAuth is configured and working
- Email/password authentication is working
- Style profiles persist between sessions
- Iris AI chat is available
- Iris remembers prior conversations
- Wardrobe items save per user
- Wardrobe data is separated between users
- Wardrobe item images persist after reload for new uploads
- The app is deployed to Vercel production
- Supabase Edge Function backend is deployed and reachable

### Current Wardrobe Limitations

- Users cannot delete wardrobe items yet
- Users cannot edit wardrobe items yet
- Wardrobe cards do not open into a full item detail view yet
- Users cannot attach multiple photos to one wardrobe item yet
- Users cannot manually correct brand details yet
- Users cannot manually correct fit details yet
- Supabase Storage migration is still planned for more durable image handling

### Recommended Next Wardrobe Build Order

1. Add item detail view
2. Add edit item fields for corrections
3. Add delete item with confirmation
4. Add richer fit/brand metadata
5. Add multiple photos per item
6. Migrate images to Supabase Storage
