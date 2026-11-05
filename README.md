# Vision Effects website (version 3)

The marketing site for Vision Effects, a branding and print studio in Accra. Built with [Astro](https://astro.build) as a fully static site.

## Run it locally

```bash
npm install
npm run dev
```

## Build it

```bash
npm run build
```

The finished site is written to `dist/`. Any static host can serve that folder.

## Deploy settings

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output folder | `dist` |
| Node version | 22.23.4 or newer |

The live domain is set in `astro.config.mjs` as `site`, and in `public/robots.txt`. Change both if the site moves. Hosts should serve `404.html` for missing pages.

## Colours

| Colour | Value | Used for |
|---|---|---|
| Purple | `#241338` (lighter `#3b2263`) | Dominant: openings, project stages, footer |
| Green | `#a8c83a` | One project stage and small details |
| Yellow | `#f0c02f` | Buttons, highlighted words, closing section, one project stage |

Warm cream `#f8f4ea` sits behind everything else.

## Motion

Animation lives in `src/scripts/motion.ts` and uses GSAP. It is switched off for visitors who ask their device to reduce motion, and everything still displays if the script fails to load.

## Product cut-outs

`src/assets/cut/` holds products cut out of their mockup photos. Replace these with exports from the original design files when available, as they will be sharper.

## Where to edit things

| What | Where |
|---|---|
| Phone, email, social links, services | `src/data/site.ts` |
| Portfolio projects and client logos | `src/data/work.ts` |
| Colours, spacing, layout | `src/styles/global.css` |
| Page text | `src/pages/` |
| Images | `src/assets/` (imported and optimised at build time) |

## Confirm before going live

- [ ] Vision Effects did every piece shown, and the captions are accurate
- [ ] Delice and Deuce Hospitality can be shown as clients
- [ ] The founder's full name (`Michael Xorla Domee` or `Michael Yao Xorla Domee`)
- [ ] "Handled by one team" and "works directly with clients" are true
- [ ] The new headlines and statement ("Brands people reach for", "A logo is a promise...") feel right for the studio
- [ ] The domain `visioneffectsgh.com` is correct
- [ ] The Instagram, Facebook and WhatsApp links open the right accounts

The "Sorce Photography" credit on the full-length founder photo is intentional. Keep it unless the photographer agrees otherwise.
