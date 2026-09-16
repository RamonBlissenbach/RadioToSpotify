/**
 * @file spotifyWorker.js
 * @description 
 * @author Ramon Blißenbach
 * @copyright Copyright © 2026 Ramon Blißenbach. All rights reserved.
 */

import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

if (!CLIENT_ID) throw new Error('SPOTIFY_CLIENT_ID missing');
if (!REFRESH_TOKEN) throw new Error('SPOTIFY_REFRESH_TOKEN missing');

let token = null;
let expiresAt = 0;

async function getSdk() {
  if (Date.now() > expiresAt - 60_000) {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: REFRESH_TOKEN
      })
    });
    if (!res.ok) throw new Error(`Refresh failed: ${await res.text()}`);
    token = await res.json();
    expiresAt = Date.now() + token.expires_in * 1000;
  }
  return SpotifyApi.withAccessToken(CLIENT_ID, token);
}

function normalize(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\(.*?\)|\[.*?\]/g, '')
    .replace(/\b(feat|ft|featuring|with)\b.*$/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function matches(track, artist, title) {
  const a = normalize(artist);
  const t = normalize(title);
  if (!a || !t) return false;
 
  const artistOk = track.artists.some(x => {
    const n = normalize(x.name);
    return n && (n.includes(a) || a.includes(n));
  });
 
  const n = normalize(track.name);
  const titleOk = n && (n.includes(t) || t.includes(n));
 
  return artistOk && titleOk;
}

export async function findTrack(artist, title) {
    const sdk = await getSdk();
    title = title.replace(/\(.*?\)|\[.*?\]/g, '').trim();

    const q = `track:${title} artist:${artist}`;
    const res = await sdk.search(q, ['track'], undefined, 5);
    const hit = res.tracks.items.find(t => matches(t, artist, title));
    return hit ?? null;
}

export async function getPlaylistUris(playlistId) {
  const sdk = await getSdk();
  const uris = new Set();
  let offset = 0;

  while (true) {
    const page = await sdk.playlists.getPlaylistItems(
      playlistId, undefined, undefined, 100, offset
    );
    for (const item of page.items) {
      if (item.track?.uri) uris.add(item.track.uri);
    }
    if (page.items.length < 100) break;
    offset += 100;
  }
  return uris;
}

export async function addTrack(playlistId, uri) {
  const sdk = await getSdk();
  await sdk.playlists.addItemsToPlaylist(playlistId, [uri]);
}