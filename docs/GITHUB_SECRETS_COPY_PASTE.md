# GitHub Pages — where to copy & paste (Firebase → GitHub)

Do this **after** you have your web app’s `firebaseConfig` open in Firebase (gear → **Project settings** → scroll to **Your apps** → **Web** `</>`).

---

## Where you paste secrets (open this in your browser)

**Repository secrets page (Pustakalaya):**  
https://github.com/ak-apoorvkulkarni/Pustakalaya/settings/secrets/actions  

Click **New repository secret** for **each** row below.

---

## For each secret: what to copy where

| Step | In GitHub: field **Name** (copy exactly) | In GitHub: field **Secret** (paste from Firebase) |
|------|------------------------------------------|---------------------------------------------------|
| 1 | `VITE_FIREBASE_API_KEY` | From `firebaseConfig`, copy the **`apiKey`** value only (the text inside the quotes, **do not** paste the quotes). |
| 2 | `VITE_FIREBASE_AUTH_DOMAIN` | From `firebaseConfig`, copy **`authDomain`** (inside quotes, no quotes in Secret box). |
| 3 | `VITE_FIREBASE_PROJECT_ID` | From `firebaseConfig`, copy **`projectId`**. |
| 4 | `VITE_FIREBASE_STORAGE_BUCKET` | From `firebaseConfig`, copy **`storageBucket`**. |
| 5 | `VITE_FIREBASE_MESSAGING_SENDER_ID` | From `firebaseConfig`, copy **`messagingSenderId`**. |
| 6 | `VITE_FIREBASE_APP_ID` | From `firebaseConfig`, copy **`appId`**. |
| 7 (optional) | `VITE_FIREBASE_MEASUREMENT_ID` | From `firebaseConfig`, copy **`measurementId`** if it exists. |

**Rules:** Secret **names** must match the table exactly (letters, numbers, underscores only — **no spaces**).  
**Values** are pasted only in the **Secret** box, never in the name.

---

## Where those Firebase values live

1. https://console.firebase.google.com/  
2. Open your project.  
3. Click **gear** → **Project settings**.  
4. Scroll to **Your apps** → select the **Web** app (`</>`).  
5. You’ll see **`firebaseConfig`** with `apiKey`, `authDomain`, etc. — that’s the source for every **Secret** column above.

---

## After all secrets are saved

1. Open: https://github.com/ak-apoorvkulkarni/Pustakalaya/actions/workflows/deploy-pages.yml  
2. Click **Run workflow** → **Run workflow** (or open the latest run → **Re-run all jobs**).  
3. Wait for a **green** checkmark.  
4. Firebase → **Authentication** → **Settings** → **Authorized domains** → **Add domain**:  
   `ak-apoorvkulkarni.github.io`  
5. Open your site: https://ak-apoorvkulkarni.github.io/Pustakalaya/  
   Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows).

---

## Copy-paste blocks — **Name** only (use one per new secret)

Paste each line into GitHub’s **Name** field (then fill **Secret** from Firebase as in the table).

```
VITE_FIREBASE_API_KEY
```

```
VITE_FIREBASE_AUTH_DOMAIN
```

```
VITE_FIREBASE_PROJECT_ID
```

```
VITE_FIREBASE_STORAGE_BUCKET
```

```
VITE_FIREBASE_MESSAGING_SENDER_ID
```

```
VITE_FIREBASE_APP_ID
```

```
VITE_FIREBASE_MEASUREMENT_ID
```

Do **not** commit real keys into this file or into git. Use **GitHub → Secrets** only.
