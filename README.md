# RadioToSpotify

Reads a radio station's now-playing text and adds the track to a Spotify playlist.

Proof of concept: every minute the script checks what's currently playing on 1Live (a German radio station), looks the song up on Spotify and appends it to a playlist.

## Setup

Requires Node 22+.
 
1. `npm install`
2. Create an app at [developer.spotify.com](https://developer.spotify.com/dashboard). Add `http://127.0.0.1:3000/callback` as a redirect URI and add yourself under User Management.
3. Create `.env`:
```
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REFRESH_TOKEN=
```
 
4. Set `url` and `playlistId` in `config.json`.
5. Run `node --env-file=.env auth.js`, open `http://127.0.0.1:3000/login`, approve, and paste the printed refresh token into `.env`.
6. Run `node --env-file=.env app.js`.

## Known limitations

This is intentionally kept simple. What doesn't work well:

- Spotify search doesn't always hit the right track. Matching is a plain text search on artist and title only. Remixes, live versions, features, radio edits or different spellings can end up as the wrong version in the playlist – or as no match at all. A similarity score over several candidates would be the obvious next step.
- The one-minute interval can miss tracks if a short song slips between two polls.
- Barely any error handling. No retries, no backoff on rate limits.
- No deployment setup. It runs locally for as long as the process runs.

## Note

Personal hobby project, not an official tool. Not affiliated with WDR / 1Live or Spotify. The playlist data belongs to WDR.

MIT licensed. Issues and pull requests are welcome.