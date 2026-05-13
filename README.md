# Vault Notes — Private Note Taking

A privacy-first note-taking app. No servers, no cloud, no tracking. Your notes live entirely in your browser's local storage.

## Features

- **100% Private** — Notes never leave your device
- **Persistent** — Notes survive browser restarts via localStorage
- **Tags & Search** — Organize and find notes instantly
- **Pin Notes** — Keep important notes at the top
- **Export/Import** — Back up notes as JSON files, transfer between devices
- **Responsive** — Works on desktop and mobile
- **Keyboard Friendly** — Tab through the interface naturally

---

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Deploy to the Web

### Option A: Vercel (Easiest — Recommended)

1. Create a free account at [vercel.com](https://vercel.com)
2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. From the project folder, run:
   ```bash
   vercel
   ```
4. Follow the prompts (defaults are fine). Done! You'll get a public URL like `vault-notes.vercel.app`.

**Or deploy via GitHub:**
1. Push this project to a GitHub repo
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo → Vercel auto-detects Vite and deploys

### Option B: Netlify

1. Build the project:
   ```bash
   npm run build
   ```
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag and drop the `dist` folder
4. Done! You get a public URL instantly.

**Or via CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Option C: GitHub Pages

1. Install the GitHub Pages plugin:
   ```bash
   npm install -D gh-pages
   ```

2. Add to `vite.config.js`:
   ```js
   export default defineConfig({
     plugins: [react()],
     base: '/your-repo-name/',
   })
   ```

3. Add deploy script to `package.json`:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

4. Push to GitHub, then run:
   ```bash
   npm run deploy
   ```

5. In your repo settings → Pages → set source to `gh-pages` branch.

---

## Custom Domain (Optional)

All three platforms support custom domains for free:

- **Vercel**: Settings → Domains → Add your domain
- **Netlify**: Site settings → Domain management → Add custom domain
- **GitHub Pages**: Settings → Pages → Custom domain

---

## Privacy Guarantee

This app stores **zero data on any server**. All notes are kept in your browser's `localStorage`, which means:

- Only you can see your notes
- Notes persist until you clear your browser data
- Export regularly to back up your notes
- Use Import to restore notes or move to another browser/device

## License

MIT
