# Neuro-Affective Interaction Lab — Website

Official website of the **Neuro-Affective Interaction Lab** (PI: Prof. Michiel Spapé),
Centre for Cognitive and Brain Sciences, University of Macau.

Built with React + TypeScript + Vite + Tailwind CSS + Three.js.
Default language English, switchable to Traditional Chinese (繁體中文).

## Run locally

```bash
npm install
npm run dev        # dev server with HMR
npm run build      # production build → dist/
npm run preview    # serve the production build
```

## Site structure

| Route             | File                            | Content |
| ----------------- | ------------------------------- | ------- |
| `/`               | `src/pages/Home.tsx`            | Hero (interactive tactile field), PI, research interests, people |
| `/research`       | `src/pages/Research.tsx`        | Focus areas, methods, current research threads |
| `/publications`   | `src/pages/Publications.tsx`    | Publication list with year/topic filters |
| `/media`          | `src/pages/Media.tsx`           | News & media coverage |
| `/contact`        | `src/pages/Contact.tsx`         | Address, email, phone, consultation hours, join the lab |
| `/people/:id`     | `src/pages/MemberProfile.tsx`   | Styled per-member page: photo, role, interests, related publications |
| `/admin`          | `src/pages/Admin.tsx`           | Blog-style content manager |

Each page is a single self-contained file — edit one without touching the others.

## Updating content (publications / news / members)

Two ways:

1. **Quick (browser only):** open `/#/admin`, edit entries, done — changes are saved in
   that browser's localStorage and appear on the site immediately *in that browser*.
2. **Permanent (for all visitors):** in `/#/admin` click **Export JSON**, then replace the
   `defaultContent` object in `src/data/content.ts` with the exported data
   (or edit `src/data/content.ts` directly) and run `npm run build` + redeploy.

Member photos live in `public/assets/people/` (sourced from the official CCBS people
pages). A member's **publication author aliases** (editable in Admin) link them to their
papers on their profile page at `/#/people/<id>`.

## Text & translations

All UI text lives in `src/i18n/translations.ts` under `en` and `zh` (Traditional Chinese).
To change wording, edit the strings there — no component changes needed.

## The interactive background

`src/components/TactileField.tsx` — a Three.js shader-based "tactile membrane":
the cursor presses a glowing bulge into a field of sensory points, clicks emit
expanding ripples. Used on the Home hero and the Research/Contact headers.
Tuning constants (grid density, ripple speed, colors) are at the top of the shaders
in that file.

## Assets

`public/assets/` — lab logo (`lab-logo.png`, `lab-logo-outline.png`) and PI photo
(`pi-photo.webp`). Source files live in `../素材/`.

## Deployment

`npm run build` produces a static site in `dist/` — deployable to GitHub Pages,
Vercel, Netlify or any static host. Routing uses hash URLs (`/#/research`), so no
server-side rewrite rules are required.
