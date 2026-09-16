/**
 * @file musicFetcher.js
 * @description 
 * @author Ramon Blißenbach
 * @copyright Copyright © 2026 Ramon Blißenbach. All rights reserved.
 */

import Config from './config.json' with { type: 'json' };

export async function getCurrentTitle() {
  const res = await fetch(Config.url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}