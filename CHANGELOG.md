# Changelog

## July 5, 2026 — Production OAuth Fixed

- Fixed Google OAuth login flow for IRYS.
- Added dedicated `/auth/callback` route for Supabase PKCE authentication.
- Updated Supabase redirect allowlist with production callback URLs.
- Updated Google OAuth configuration.
- Verified Google sign-in works successfully on production.
- Confirmed IRYS is running live at https://www.irysstyle.com.

Milestone: IRYS now has working production authentication.
