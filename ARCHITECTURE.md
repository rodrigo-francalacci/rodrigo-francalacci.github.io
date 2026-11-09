# Architecture — rodrigo.francalacci.com

Status: third draft (2026-11-09). Items marked **[DECIDE]** are Rod's open decisions.

## 1. Public and private (decided 2026-11-09)
- **Public:** only the home page and, later, the public CV. These stay on **GitHub Pages**.
- **Login required:** the whole calculators area, meaning the list of calculators and every calculator. These are hosted on **Cloudflare Workers behind Cloudflare Access**, and only Rod's email address is allowed in. (Cloudflare has merged Pages into Workers.)
- **Why:** GitHub Pages has no access control; anything it serves can be downloaded by anyone. Cloudflare Access checks the login at Cloudflare's edge **before any file is sent**, so the calculators' code, methods and manufacturer data are never public.
- **GitHub Pages stays off for every calculator repository.** The calculator repositories stay **private** on GitHub.
- **Private documents and saved projects** (later) live in Firebase, behind sign-in and security rules (§4).

## 2. Addresses
### Recommended: a separate host for the calculators
| Address | Served by | Login |
|---|---|---|
| `rodrigo.francalacci.com/` | GitHub Pages, repository `rodrigo-francalacci.github.io` | public |
| `rodrigo.francalacci.com/cv/` (later) | same | public |
| `calculators.rodrigo.francalacci.com/` | Worker `calculators-hub`: the calculators list | Cloudflare Access |
| `calculators.rodrigo.francalacci.com/crosstalk-calculator/` | Worker `crosstalk-calculator`, through the hub | Cloudflare Access |
| `calculators.rodrigo.francalacci.com/mne-noise-calculator/` | Worker `mne-noise-calculator`, through the hub | Cloudflare Access |

How it works (built 2026-11-09):
- **One Worker per calculator** with **no public address** (`workers_dev = false`, no routes). It serves a staged copy of the calculator's app files and nothing else.
- **The hub Worker** `calculators-hub` has the custom domain `calculators.rodrigo.francalacci.com`. It serves the list, `calculators.json` and `/shared/`, and passes `/<repository-name>/...` to that calculator's Worker through a **service binding**, the only way to reach it.
- **One Access application, "Calculators",** covers the whole hostname with the reusable policy **"Rod only"** (Allow, email rodrigo.francalacci@gmail.com; 24-hour session). Rod signs in with a **One-time PIN** emailed to that address. The account's other login method, "Cloudflare", uses whichever Cloudflare account the browser is logged into, so it is refused for anyone else.
- **No `*.pages.dev`, no `*.workers.dev`, no service tokens.**
- **The website** links to the calculators host from the home page footer ("Calculators (sign-in)").
- **DNS:** `rodrigo` → `rodrigo-francalacci.github.io` (CNAME, DNS only). The hub's custom domain manages the `calculators.rodrigo` record.
- **Certificate:** Cloudflare issued one for `calculators.rodrigo.francalacci.com` automatically (tested 2026-11-09); no paid certificate needed.

### Alternative: paths on one domain
`rodrigo.francalacci.com/calculators/...` could be kept by switching the `rodrigo` record to Cloudflare's proxy (orange cloud) and putting a Worker on the path `rodrigo.francalacci.com/calculators/*`. That Worker would send calculator paths to Cloudflare Pages, while everything else passes through to GitHub Pages. Access then protects only that path.
- **For:** one address.
- **Against:** GitHub Pages behind Cloudflare's proxy needs SSL mode "Full" and complicates GitHub's own HTTPS certificate. The public site depends on the Worker. One routing mistake could expose a calculator path or break the home page.
- **Not recommended** while the separate host works.

## 3. Repositories and local folders
```
francalacci-site/               (parent folder, not a repository)
  website/                      → rodrigo-francalacci.github.io  (public, GitHub Pages)
  calculator-template/          → calculator-template            (private, template repository)
  crosstalk-calculator/         → crosstalk-calculator           (private, Cloudflare Worker)
  mne-noise-calculator/         → mne-noise-calculator           (private, Cloudflare Worker)
  calculators-hub/              → calculators-hub                (private: hub Worker, list, calculator deploy configs)
```
- **The calculators list and `calculators.json`** live in `calculators-hub/public/` (moved from `website/` on 2026-11-09), because the list is behind the login too. 
- **Deploy configs for the calculator Workers** live in `calculators-hub/workers/<id>/`, so the calculator repositories don't change. `node stage.js` copies the app files in; then `wrangler deploy --dry-run` and `wrangler deploy`, **run inside that folder**.
- **`website/shared/vb6-theme.css`** stays the theme's master copy; calculators keep vendored copies, as now.

To add a calculator:
1. Click **Use this template** on `calculator-template` (private).
2. Clone it next to the others and build it in its own Claude Code sessions.
3. Add `calculators-hub/workers/<id>/` (copy an existing one) and deploy it; add its service binding to the hub's `wrangler.toml` and its entry to `calculators.json`.
4. Deploy the hub, then check every address asks for sign-in.

## 4. Firebase (one project for the calculators) — later phase
- **Sign-in:** Firebase Auth with Google. Authorised domains: `calculators.rodrigo.francalacci.com` (where the calculators run), `rodrigo.francalacci.com` (if private website pages are added later), and `localhost`.
- **Access and Firebase do different jobs:** Access decides who can load the pages; Firebase decides whose data is read and saved. Both stay.
- **Firestore layout:**
  - `users/{uid}/apps/{appId}/projects/{projectId}` holds the project metadata (name, ref, client, savedAt, size).
  - Large projects are split, e.g. `.../projects/{projectId}/parts/{partId}`, to stay under Firestore's 1 MiB per document.
- **Security rules:** read and write only when `request.auth.uid == uid`, and only Rod's uid.
- **`cloud.js`** is served by the calculators host at `/shared/cloud.js`, the same origin as the calculators. API in `CALCULATOR-CONTRACT.md` §5.
- **Free plan only** (no card) unless Rod decides otherwise.

## 5. Phases
1. **Website:** repository, domain (`rodrigo` → GitHub Pages) and HTTPS; a simple public home page. The calculators list is not published here.
2. **Calculators behind login:** done 2026-11-09 (Zero Trust Free; Access app "Calculators"; hub and two calculator Workers; every address checked).
3. **M&E calculator:** adopt the contract (root `index.html` etc., see its `SITE-CHANGES.md`), then switch its deploy config to the root `index.html`.
4. **Firebase:** project, `cloud.js`, security rules; Save/Open in the crosstalk calculator first.
5. **Public CV** on the website; private documents on Firebase or behind Access.
