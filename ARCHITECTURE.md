# Architecture — rodrigo.francalacci.com

Status: second draft (2026-11-09). Items marked **[DECIDE]** are Rod's open decisions.

## 1. Public and private (decided 2026-11-09)
- **Public:** only the home page and, later, the public CV. These stay on **GitHub Pages**.
- **Login required:** the whole calculators area, meaning the list of calculators and every calculator. These are hosted on **Cloudflare Pages behind Cloudflare Access**, and only Rod's email address is allowed in.
- **Why:** GitHub Pages has no access control; anything it serves can be downloaded by anyone. Cloudflare Access checks the login at Cloudflare's edge **before any file is sent**, so the calculators' code, methods and manufacturer data are never public.
- **GitHub Pages stays off for every calculator repository.** The calculator repositories stay **private** on GitHub. Cloudflare Pages can deploy from private repositories.
- **Private documents and saved projects** (later) live in Firebase, behind sign-in and security rules (§4).

## 2. Addresses
### Recommended: a separate host for the calculators
| Address | Served by | Login |
|---|---|---|
| `rodrigo.francalacci.com/` | GitHub Pages, repository `rodrigo-francalacci.github.io` | public |
| `rodrigo.francalacci.com/cv/` (later) | same | public |
| `calculators.rodrigo.francalacci.com/` | Cloudflare: the calculators list | Cloudflare Access |
| `calculators.rodrigo.francalacci.com/crosstalk-calculator/` | Cloudflare Pages project `crosstalk-calculator` | Cloudflare Access |
| `calculators.rodrigo.francalacci.com/mne-noise-calculator/` | Cloudflare Pages project `mne-noise-calculator` | Cloudflare Access |

How it works:
- **One Cloudflare Pages project per calculator,** each deployed from its own private GitHub repository on every push to `main`. The project's own address (`<repo>.pages.dev`) is not used publicly and **must also be behind Access** (see the steps).
- **The calculators host** is a small **Cloudflare Worker** (free plan) on `calculators.rodrigo.francalacci.com`. It serves the calculators list at `/`, and for `/<repository-name>/...` it fetches the file from that calculator's Pages project. This keeps the contract's rule that the repository name is the address.
- **One Access application** covers the whole hostname `calculators.rodrigo.francalacci.com`, with a policy that allows only Rod's email (login by one-time code sent to that address, or Google). Rod signs in once and every calculator is open.
- **The website** links to the calculators host from the home page. **[DECIDE]** whether the public home page shows that link at all.
- **DNS:** the website keeps `rodrigo` → `rodrigo-francalacci.github.io` (CNAME, DNS only). The Worker's custom domain creates the `calculators.rodrigo` record itself.
- **Certificate check:** `calculators.rodrigo.francalacci.com` is two levels below `francalacci.com`. Cloudflare's free Universal SSL certificate only covers one level (`*.francalacci.com`). Worker custom domains are expected to get their own certificate; **check this on the first deploy**. If they don't, use **`calculators.francalacci.com`** instead (covered for free) rather than paying for Advanced Certificate Manager. **[DECIDE]** hostname.

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
  crosstalk-calculator/         → crosstalk-calculator           (private, Cloudflare Pages)
  mne-noise-calculator/         → mne-noise-calculator           (private, Cloudflare Pages)
  calculators-hub/              → calculators-hub (to create)    (private: the Worker and the list page)
```
- **The calculators list and `calculators.json`** live in `calculators-hub/public/` (moved from `website/` on 2026-11-09), because the list is behind the login too. Each entry gets an `origin` (its `*.pages.dev` address) once its Pages project exists.
- **The hub reaches each `*.pages.dev`** (itself behind Access) with an Access **service token** stored as Worker secrets.
- **`website/shared/vb6-theme.css`** stays the theme's master copy; calculators keep vendored copies, as now.

To add a calculator:
1. Click **Use this template** on `calculator-template` (private).
2. Clone it next to the others and build it in its own Claude Code sessions.
3. Create a Cloudflare Pages project from the repository, with no build command and output directory `/`.
4. Add it to `calculators.json` and the Worker's route list in `calculators-hub`.

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
2. **Calculators behind login:**
   1. Cloudflare Zero Trust (free plan, up to 50 users; Cloudflare may ask for a card even on the free plan, so **ask Rod first**).
   2. A Cloudflare Pages project for `crosstalk-calculator`, deployed from the private repository.
   3. The `calculators-hub` Worker with its custom domain and the list page.
   4. The Access application on the calculators hostname, plus Access on each `<repo>.pages.dev`, so neither can be reached without login.
   5. Check that every address returns a login screen in a private browser window before anything else is added.
3. **M&E calculator:** adopt the contract (root `index.html` etc., see its `SITE-CHANGES.md`), then its own Pages project behind the same Access.
4. **Firebase:** project, `cloud.js`, security rules; Save/Open in the crosstalk calculator first.
5. **Public CV** on the website; private documents on Firebase or behind Access.
