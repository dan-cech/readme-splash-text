# readme-splash-text

A tiny Vercel serverless function that returns a random, Minecraft-style splash
text as an animated SVG image — embed it in your GitHub profile README and get
a different splash on every page load.

## How it works

`api/splash.js` is a single Node.js function (no dependencies, no build step).
On every request it picks a random string from the `CONFIG.splashes` list,
renders it as an SVG with a tilted, pulsing, drop-shadowed yellow title-screen
look, and returns it with caching disabled so GitHub's image proxy (Camo)
always fetches a fresh copy instead of reusing a cached one.

## Embedding it

Paste this into your profile README (replace the URL with your own deployment):

```md
![splash](https://dan-cech-splashtext.vercel.app/api/splash)
```

The README file itself never changes — only the image updates, each time it's
loaded.

## Testing it

Open `https://dan-cech-splashtext.vercel.app/api/splash` directly in a private/
incognito browser window and refresh a few times. You should see a different
splash, freshly rendered, on every refresh (a normal window may cache the image).

## Customizing

Everything tunable lives in the `CONFIG` block at the top of `api/splash.js`:

- `splashes` — the list of strings to pick from at random
- `width` / `height` / `padding` — canvas size and safety margin
- `fontFamily`, `fontWeight`, `baseFontSize`, `minFontSize` — typography;
  long splashes automatically shrink their font (down to `minFontSize`) so
  they don't clip
- `textColor` / `shadowColor` / `shadowOffsetX` / `shadowOffsetY` — colors
  and drop shadow
- `rotateDeg` — tilt angle
- `pulseMaxScale` / `pulseDurationSec` — pulse animation size and speed

Edit the values, commit, and push — Vercel redeploys automatically.
