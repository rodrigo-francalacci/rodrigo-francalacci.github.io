# Calculator contract

Every calculator published on rodrigo.francalacci.com follows these rules. A calculator's `CLAUDE.md` says "follow the website's CALCULATOR-CONTRACT.md", and the website's architect checks it.

## 1. Repository
- **One repository per calculator.** The repository name is its address: `/<repository-name>/`.
- **`index.html` at the root** is the complete app. It opens by **double-clicking** (`file://`) and on GitHub Pages. Use no ES modules (they fail on `file://`); use classic `<script>` tags or one built file.
- **No frameworks** and no runtime packages. Node is used only for build scripts and tests.
- **`CLAUDE.md`, `README.md`, `tests/`** (maths tests that exit non-zero on failure), and `.nojekyll`.
- **`SITE-CHANGES.md`:** requests from the website's architect, newest first. Mark each one done, with the date and commit, when handled.

## 2. Look and behaviour
- **Theme:** the VB6 theme from `website/shared/vb6-theme.css`, vendored as a copy inside the calculator so it works offline. When the website's copy changes, the architect posts a SITE-CHANGES note.
- **Dialogs and menus:** use the patterns from the crosstalk calculator: `dialog()`, `msgBox()`, `askText()`, menu bar, right-click menus (`openCtx()`), and `copyText()`/`copyRich()`. Never use `alert`, `confirm` or `prompt`.
- **Usability:** everything works by keyboard; Escape closes the top dialog.
- **Units and language:** UK English, SI units. Equations in help and docs define every symbol.

## 3. Data files
- **JSON import/export always available**, even when cloud save exists.
- **Every file carries an identifier:** `"format": "<calculator id>"`, `"version": n`, `"savedAt"`. Older versions must always open (migrate, never break).
- **`localStorage`** is only a convenience autosave: wrap it in try/catch, and the app must work without it.

## 4. Footer and links
- **Header:** a small "← Calculators" link to `/calculators/`, shown only when served over http(s), not from a file.
- **About/Help:** shows the version and date of the last change.

## 5. Cloud save (when `shared/cloud.js` exists — later phase)
- **Loading:** the calculator loads `/shared/cloud.js` only when served from the website, and shows **Save**, **Save as** and **Open** only if `window.SiteCloud` is present.
- **API (all async):**
  - `SiteCloud.user()`
  - `SiteCloud.signIn()`, `SiteCloud.signOut()`
  - `SiteCloud.list(appId)` → `[{ id, name, ref, client, savedAt }]`
  - `SiteCloud.load(appId, id)` → the same JSON as Export
  - `SiteCloud.save(appId, idOrNull, meta, json)` → id
  - `SiteCloud.remove(appId, id)`
- **`appId`** is the calculator's repository name. The JSON saved is exactly the export JSON, so files and cloud stay interchangeable.

## 6. Listing
- **Entry in `website/calculators.json`:**
  - `{ "id": "<repository-name>", "name", "description", "path": "/<repository-name>/", "status": "live" | "in development" | "private", "updated": "YYYY-MM-DD" }`
