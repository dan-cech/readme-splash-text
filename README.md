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

## Want to use this yourself?

You have two options, depending on how much control you want.

### Option A: just use my link (easiest)

Paste the same embed line from above, as-is, into your own profile README:

```md
![splash](https://dan-cech-splashtext.vercel.app/api/splash)
```

That's it — no account, no deploy, nothing to set up. This is fine for casual
use; the function is tiny and Vercel's free tier has plenty of headroom. The
only downside: you'll see *my* splash texts, not your own, and if I ever take
the project down or rename it, your image stops working.

### Option B: deploy your own copy (full control)

Do this if you want your own splash list, or just want it to keep working
independently of me.

1. **Fork this repo** on GitHub (button in the top right of the repo page).
2. **Edit your splash list** — open `api/splash.js` in your fork and change
   the `splashes` array in the `CONFIG` block at the top to your own lines.
   (See [Customizing](#customizing) below for everything else you can tweak.)
3. **Deploy it on Vercel** (free account, no card required):
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub.
   - Click **Add New → Project**, pick your fork from the list.
   - Framework Preset: `Other`, Root Directory: `./`, leave everything else
     default, no environment variables needed. Click **Deploy**.
   - Vercel builds it in under a minute and gives you a URL like
     `https://<your-project-name>.vercel.app`.
4. **Update the embed line** in your profile README to point at your own URL:
   ```md
   ![splash](https://<your-project-name>.vercel.app/api/splash)
   ```
5. From then on, any `git push` to your fork's `main` branch auto-redeploys —
   so changing your splash list later is just: edit, commit, push.

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

### Using a custom font

Drop a `.ttf` file at `fonts/splash.ttf` (the exact filename matters — that's
what `CONFIG.customFontPath` points at). On the next deploy, the function
embeds it directly into the SVG as a base64 `@font-face`, which is required
since GitHub loads this as a plain `<img>` and can't fetch a separately linked
font file. If no file is there, it just falls back to `CONFIG.fontFamily`
with no errors.

`vercel.json` already tells Vercel to include everything under `fonts/` when
deploying the function, so no extra setup is needed beyond adding the file.
