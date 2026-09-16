/**
 * @file app.js
 * @description 
 * @author Ramon Blißenbach
 * @copyright Copyright © 2026 Ramon Blißenbach. All rights reserved.
 */

import Config from './config.json' with { type: 'json' };
import { getCurrentTitle } from './musicFetcher.js';
import { findTrack, getPlaylistUris, addTrack } from './spotifyWorker.js';

const known = await getPlaylistUris(Config.playlistId);

async function tick() {
  var title = (await getCurrentTitle()).trim();
  if (!title) return;

  const [artist, ...rest] = title.split(' - ');
  title = rest.join(' - ');
  if (!artist || !title) return;

  const track = await findTrack(artist, title);
  if (!track) return console.log('Not found:', title);
  if (known.has(track.uri)) return;

  await addTrack(Config.playlistId, track.uri);
  known.add(track.uri);
  console.log('Added:', track.artists[0].name, '–', track.name);
}

await tick();
setInterval(() => tick().catch(console.error), 60_000);