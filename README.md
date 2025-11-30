# FOSS Hub

**Offline-first, installable PWA** showcasing Kerala & open-source projects. Built with React + Vite, IndexedDB caching (`idb-keyval`), and wrapped with Capacitor to produce an Android APK.

## Highlights
- Offline-first: metadata cached in IndexedDB and served when offline
- PWA ready (service worker via `vite-plugin-pwa`)
- Search, license filter, Malayalam UI toggle
- Simple SPA refresh (no full reload)
- Small, clean, mobile-friendly UI with icons via `react-icons`

## Demo & Screenshots

- Desktop view: `docs/screenshots/desktop-list.png`  
- Mobile view: `docs/screenshots/mobile-list.png`  
- Offline mode (cached data): `docs/screenshots/offline.png`  
- Malayalam mode: `docs/screenshots/malayalam.png`  
- Search & filter controls: `docs/screenshots/search-filter.png`

## Quick start (dev)
```bash
git clone https://github.com/Jonahs17/foss-hub.git
cd foss-hub
npm install
# add your GitHub token for higher rate limits
# create .env.local with: VITE_GITHUB_TOKEN=ghp_xxx
npm run dev
```
Open http://localhost:5173 in your browser.

## Build Production
```bash
npm run build
# preview the production build
npm run preview
```

## Capacitor (Android) — build APK

First-time (one-time)
```bash
# install capacitor packages locally (if not already)
npm install @capacitor/core @capacitor/cli --save-dev
# init (only once) — choose package id like com.yourname.fosshub
npx cap init "FOSS Hub" com.yourname.fosshub

# install Android platform
npm install @capacitor/android
npx cap add android
```

After every web change
```bash
# 1. build web assets
npm run build

# 2. copy to native project
npx cap copy android

# 3. open Android Studio (or build via CLI)
npx cap open android
# OR build debug apk from CLI:
cd android
./gradlew assembleDebug
# APK path:
android/app/build/outputs/apk/debug/app-debug.apk
# install on connected device:
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## License
MIT

## Contact
Jonahs George - Github: [Jonahs17](https://github.com/Jonahs17)

