import { ASSET_MAP } from '@/data/asset-map';

/**
 * Resolve a public asset path (e.g. './assets/people/x.jpg') to an inlined
 * data URI at build time. Falls back to the raw path for user-supplied URLs
 * (admin panel) and for the dev server, which serves public/ directly.
 */
export function assetUrl(p?: string): string | undefined {
  if (!p) return p;
  return ASSET_MAP[p] ?? p;
}
