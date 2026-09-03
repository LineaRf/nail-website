# Neuro-Affective Interaction Lab — Website

Official website of the **Neuro-Affective Interaction Lab** (PI: Prof. Michiel Spapé),
Centre for Cognitive and Brain Sciences, University of Macau.

**Live site:** https://linearf.github.io/

Built with React + TypeScript + Vite + Tailwind CSS + Three.js.
Default language English, switchable to Traditional Chinese (繁體中文).

## Repositories

| Repo | Purpose |
| --- | --- |
| [`LineaRf/nail-website`](https://github.com/LineaRf/nail-website) | This source code |
| [`LineaRf/LineaRf.github.io`](https://github.com/LineaRf/LineaRf.github.io) | Deployed static build (GitHub Pages) |

## Run locally

```bash
npm install
npm run dev        # dev server with HMR
npm run build      # gen-asset-map + tsc + vite build → dist/
npm run preview    # serve the production build
```

## Updating content — no rebuild needed

Open `https://linearf.github.io/#/admin` on any device (incl. iPad):

1. Edit publications / news / members (photos & news images upload directly —
   they are compressed in the browser before saving).
2. Edits are staged as a **draft** in that browser (preview instantly).
3. Press **🚀 Publish to live site** — the Admin commits `content.json` to the
   Pages repo through the GitHub API (OAuth device flow, one-time authorization
   per browser). Everyone sees the update in ~30 s.

Publishing requires write access to `LineaRf/LineaRf.github.io`
(add lab members as collaborators to let them publish).

The site loads `content.json` at runtime and falls back to the bundled defaults
(`src/data/content.json`) when offline.

## Site structure

| Route             | File                            | Content |
| ----------------- | ------------------------------- | ------- |
| `/`               | `src/pages/Home.tsx`            | Hero (interactive tactile field), PI, research interests, people, latest news |
| `/people`         | `src/pages/People.tsx`          | Full roster grouped by role (PI / postdoc / PhD / RA / members / alumni) |
| `/research`       | `src/pages/Research.tsx`        | Focus areas, methods, current research threads |
| `/publications`   | `src/pages/Publications.tsx`    | Publication list with year/topic filters |
| `/media`          | `src/pages/Media.tsx`           | News with headline layout (featured card + flexible side cards) |
| `/contact`        | `src/pages/Contact.tsx`         | Address, email, phone, consultation hours, join the lab |
| `/people/:id`     | `src/pages/MemberProfile.tsx`   | Styled per-member page: photo, role, interests, related publications |
| `/admin`          | `src/pages/Admin.tsx`           | Content manager + publish panel + visit stats |

Each page is a single self-contained file — edit one without touching the others.

## Visit statistics

Account-free [Vercount](https://cn.vercount.one/) (busuanzi-compatible) counter:
total PV / UV shown subtly in the footer and in the Admin stats card.

## Text & translations

All UI text lives in `src/i18n/translations.ts` under `en` and `zh` (Traditional Chinese).
To change wording, edit the strings there — no component changes needed.

## The interactive background

`src/components/TactileField.tsx` — a Three.js shader-based "tactile membrane":
the cursor presses a glowing bulge into a field of sensory points, clicks emit
expanding ripples. Used on the Home hero and the Research/Contact headers.

## Assets & build notes

- Original images live in `assets-src/`; `scripts/gen-asset-map.mjs` inlines them
  as data URIs into `src/data/asset-map.ts` at build time (keeps the deployed
  repo text-only), and copies `src/data/content.json` → `public/content.json`.
- `assetUrl()` (`src/lib/asset.ts`) resolves `./assets/...` paths to the inlined
  data URIs and passes through uploaded data URIs / external URLs unchanged.
- Routing uses hash URLs (`/#/research`), so no server-side rewrites are needed.

## Deploying changes to the code

```bash
npm run build
# then copy dist/* into a checkout of LineaRf/LineaRf.github.io and push —
# or ask the Kimi agent to do it (it has the credentials on the owner's machine).
```
