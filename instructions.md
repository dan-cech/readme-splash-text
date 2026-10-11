# Project: Random splash text for my GitHub profile README

## Goal
Build a tiny Vercel serverless function that returns a random, Minecraft-style
splash text as an animated SVG image. My GitHub profile README will embed it as
an image, so each page load shows a different splash. The README itself is never
modified; only the image changes.

## Context
- Repo: `dan-cech/readme-splash-text` (currently empty, branch `main`)
- Host: Vercel, Hobby plan, project already configured with preset "Other",
  root directory `./`, default build settings, no environment variables
- Production URL will be: `https://dan-cech-splashtext.vercel.app/api/splash`
- GitHub proxies README images through its Camo cache, so caching must be disabled

## Requirements

### File structure
- Function lives at `api/splash.js` (Vercel turns files in `api/` into endpoints)
- Plain Node.js, no framework, no dependencies, no build step
- Use `export default function handler(req, res)`
- Only add a `package.json` if it's actually required for the function to work
- Add a short `README.md` for the repo explaining what it is and how to embed it

### Code style
- Write complete files, not fragments
- Put every tunable value in a clearly labeled `CONFIG` block at the top of the
  script: splash list, colors, font, rotation, pulse scale, pulse speed, sizes
- Keep the code short, readable and commented

### Behavior
- Pick a random splash from the list on every request
- Escape XML special characters (`& < > " '`) so any splash text is safe
- Respond with `Content-Type: image/svg+xml`
- Disable all caching: `Cache-Control: no-cache, no-store, must-revalidate, max-age=0`,
  plus `Pragma: no-cache` and `Expires: 0`

### Look (Minecraft title screen style)
- One line of bold yellow text (`#FFFF00`) with a darker drop shadow
  (`#3F3F00`) offset slightly down-right
- Tilted about -20 degrees
- Gentle pulse: scale 1 → 1.1 → 1, about 0.5s per cycle, looping forever,
  ease-in-out, scaling from the text's center
- Font: a monospace/pixel-ish fallback stack is fine for now

### SVG constraints (GitHub renders it as an <img>)
- Animate with CSS `@keyframes` inside the SVG's `<style>` block
- No JavaScript inside the SVG (it's ignored)
- No external resources: no linked fonts, images or stylesheets
- Make sure the tilted, pulsing text never clips at the image edges, either by
  giving the canvas enough padding or by shrinking the font size for long splashes
- Transparent background so it looks good in both light and dark GitHub themes

### Splash list
Start with a few placeholder splashes; I'll replace them with my own.

## When you're done
1. Tell me exactly which files to commit and push to `main`
2. Give me the line to paste into my profile README:
   `![splash](https://dan-cech-splashtext.vercel.app/api/splash)`
3. Tell me how to test it: open the URL in a private window and refresh a few times
4. Briefly explain how to change the splashes and tweak the look in CONFIG later