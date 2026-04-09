# पुस्तकालयः (Pustakalaya)

Web app for managing your personal library: books, lending, wishlists, and statistics. Built with **React**, **TypeScript**, **Vite**, and **Firebase** (Google sign-in, **Firestore**, **Cloud Storage**) for sync across devices.

### How data is stored

| Service | What it holds |
|--------|----------------|
| **Firestore** | Books (`users/{uid}/books/...`), wishlist (`users/{uid}/wishlist/...`), lending fields on each book doc |
| **Cloud Storage** | Cover JPEGs at `users/{uid}/covers/{id}.jpg` (books and `wish-{id}` for wishlist) |

The Spark (free) plan includes Firestore and Storage **free-tier quotas**; you only pay if usage exceeds those limits on a billing-enabled project.

## Prerequisites

- **Node.js** 20+ (recommended)
- A **Firebase** project with:
  - **Authentication** → Google sign-in enabled  
  - **Firestore** → database created  
  - **Storage** → get started (default bucket). Copy **`storageBucket`** into `.env` as `VITE_FIREBASE_STORAGE_BUCKET` (same value as in Project settings → Your apps).

## Setup

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

   Open [Firebase Console](https://console.firebase.google.com/) → your project → **Project settings** → **Your apps** → Web app config, and fill in all `VITE_FIREBASE_*` values in `.env` (including **`VITE_FIREBASE_STORAGE_BUCKET`**).

3. Deploy security rules (recommended — from this repo root):

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add   # select your project (or copy `.firebaserc.example` → `.firebaserc` and set the project id)
   firebase deploy --only firestore:rules,storage
   ```

   `firebase.json` wires `firestore.rules` and `storage.rules`. You can instead paste each file’s contents into the console under **Firestore → Rules** and **Storage → Rules**.

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173). Restart the dev server after changing `.env`.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Local development (Vite) |
| `npm run build`| Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint                   |

## GitHub Pages (`https://ak-apoorvkulkarni.github.io/Pustakalaya/`)

1. In the GitHub repo: **Settings → Pages → Build and deployment → Source**: choose **GitHub Actions** (not “Deploy from a branch”).
2. Push to **`main`**; the workflow **Deploy to GitHub Pages** (`.github/workflows/deploy-pages.yml`) builds with `VITE_BASE=/Pustakalaya/` and publishes `dist/`.
3. **Firebase (live site):** Under **Settings → Secrets and variables → Actions**, add repository secrets matching your `.env` (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.). Without them, the build still succeeds but the app shows the setup screen. In Firebase Console → **Authentication → Settings → Authorized domains**, add **`ak-apoorvkulkarni.github.io`** so Google sign-in works on Pages.

Local preview of a Pages-like build:

```bash
VITE_BASE=/Pustakalaya/ npm run build && VITE_BASE=/Pustakalaya/ npx vite preview
```

## Privacy

Firebase stores your data under your project’s rules. Configure rules to match your security needs; the included rules scope data per authenticated user.

## License

Personal and educational use unless otherwise noted.
