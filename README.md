# FOSS Hub

**Offline-first, installable PWA** showcasing Kerala & open-source projects. Built with React + Vite, IndexedDB caching (`idb-keyval`), and wrapped with Capacitor to produce an Android APK.

## Highlights
- Offline-first: metadata cached in IndexedDB and served when offline
- PWA ready (service worker via `vite-plugin-pwa`)
- Search, license filter, Malayalam UI toggle
- Simple SPA refresh (no full reload)
- Small, clean, mobile-friendly UI with icons via `react-icons`

## Quick start (dev)
```bash
git clone https://github.com/YOUR_USERNAME/foss-hub.git
cd foss-hub
npm install
# add your GitHub token for higher rate limits
# create .env.local with: VITE_GITHUB_TOKEN=ghp_xxx
npm run dev
```

## Open https://localhost:5173 in your browser