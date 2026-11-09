# Architecture — rodrigo.francalacci.com

Status: fourth draft (2026-11-09). Items marked **[DECIDE]** are Rod's open decisions.

## 1. Site structure, public and private (decided 2026-11-09)
| Section | Public or private | Address |
|---|---|---|
| Home (overall information, photo later) | public | `rodrigo.francalacci.com/` |
| CV | public | `rodrigo.francalacci.com/cv/` |
| Contact | public | `rodrigo.francalacci.com/contact/` |
| 404 page | public | `rodrigo.francalacci.com/404.html` |
| Acoustic calculators | **private** | `my.rodrigo.francalacci.com/acoustics/calculators/` |
| Acoustic documents (library: standards, books, guides…) | **private** | `my.rodrigo.francalacci.com/acoustics/documents/` |
| Electronics calculators | **private** | `my.rodrigo.francalacci.com/electronics/calculators/` |
| Electronics documents (library: books, articles, schematics…) | **private** | `my.rodrigo.francalacci.com/electronics/documents/` |
| Electronics projects (Rod's own circuits) | **private** | `my.rodrigo.francalacci.com/electronics/projects/` |
| Admin (organising the libraries) | **private** | `my.rodrigo.francalacci.com/admin/` |

- **Public** pages are on **GitHub Pages** (repository `rodrigo-francalacci.github.io`).
- **Private** sections are on **Cloudflare Workers behind Cloudflare Access**; only Rod's email address is allowed in. (Cloudflare has merged Pages into Workers.)
- **Why:** GitHub Pages has no access control; anything it serves can be downloaded by anyone. Cloudflare Access checks the login at Cloudflare's edge **before any file is sent**, so calculator code, methods, manufacturer data and licensed documents are never public. The libraries hold licensed standards and books, so they must never be public.
- **GitHub Pages stays off for every private repository.** Calculator repositories stay **private** on GitHub.
- **Saving calculator work:** JSON files only (Export/Import). **No Firebase or cloud save until Rod says so** (§6).

## 2. Navigation and style (decided 2026-11-09)
- **Simple, text-first, fast**, in the spirit of sound-au.com (plain pages, little decoration), with a **left side navigation bar**. Our own design; nothing copied.
- **Public sidebar (option B):** Home · CV · Contact · **Sign in** (→ the private host). The private sections are not listed publicly.
- **Private sidebar:** the full menu: Home, CV, Contact, then **Acoustics** (Calculators, Documents), **Electronics** (Calculators, Documents, Projects) and **Admin**.
- **Phones:** the sidebar becomes a short menu at the top. Keyboard accessible; current page highlighted.
- **Style:** system fonts, light background with automatic dark mode, one accent colour, readable line length. One shared stylesheet, `shared/site.css`, used by both hosts so it feels like one site. Calculators keep the VB6 theme inside their own pages.
- **No build step:** each page is plain HTML with the same header and sidebar markup.

## 3. Addresses and hosting
### Private host: `my.rodrigo.francalacci.com` (decided 2026-11-09, not built yet)
- **Replaces** `calculators.rodrigo.francalacci.com`. Old calculator addresses will **redirect** to `my.rodrigo.francalacci.com/acoustics/calculators/<id>/`, so nothing breaks.
- **One Access application** covers the private host. Adding the hostname to the existing "Calculators" app (or a renamed copy) is a change on the shared account, so it's shown to Rod first.
- **Certificate:** issued free and automatically, like `calculators.rodrigo` (tested 2026-11-09).

### As built today (2026-11-09)
| Address | Served by | Login |
|---|---|---|
| `rodrigo.francalacci.com/` | GitHub Pages, repository `rodrigo-francalacci.github.io` | public |
| `calculators.rodrigo.francalacci.com/` | Worker `calculators-hub`: the calculators list | Cloudflare Access |
| `calculators.rodrigo.francalacci.com/crosstalk-calculator/` | Worker `crosstalk-calculator`, through the hub | Cloudflare Access |
| `calculators.rodrigo.francalacci.com/mne-noise-calculator/` | Worker `mne-noise-calculator`, through the hub | Cloudflare Access |

How it works:
- **One Worker per calculator** with **no public address** (`workers_dev = false`, no routes). It serves a staged copy of the calculator's app files and nothing else.
- **The hub Worker** `calculators-hub` has the custom domain. It serves the list, `calculators.json` and `/shared/`, and passes `/<repository-name>/...` to that calculator's Worker through a **service binding**, the only way to reach it.
- **One Access application, "Calculators",** covers the whole hostname with the reusable policy **"Rod only"** (Allow, email rodrigo.francalacci@gmail.com; 24-hour session). Rod signs in with a **One-time PIN** emailed to that address. The account's other login method, "Cloudflare", uses whichever Cloudflare account the browser is logged into, so it is refused for anyone else.
- **No `*.pages.dev`, no `*.workers.dev`, no service tokens.**
- **DNS:** `rodrigo` → `rodrigo-francalacci.github.io` (CNAME, DNS only). The hub's custom domain manages the `calculators.rodrigo` record.

### Alternative: paths on one domain
`rodrigo.francalacci.com/calculators/...` could be kept by switching the `rodrigo` record to Cloudflare's proxy (orange cloud) and putting a Worker on the path `rodrigo.francalacci.com/calculators/*`. That Worker would send calculator paths to Cloudflare Pages, while everything else passes through to GitHub Pages. Access then protects only that path.
- **For:** one address.
- **Against:** GitHub Pages behind Cloudflare's proxy needs SSL mode "Full" and complicates GitHub's own HTTPS certificate. The public site depends on the Worker. One routing mistake could expose a calculator path or break the home page.
- **Not recommended** while the separate host works.

## 4. Document libraries (decided 2026-11-09; not built yet; R2 not enabled)
A light, private "drive" for the acoustics and electronics documents (under 1 GB expected).
- **Files:** stored in **Cloudflare R2** (free tier: 10 GB storage, generous monthly operations). The library Worker reads and writes them through an **R2 binding**, with no GitHub token and no public bucket address.
  - **R2 is not enabled yet.** Enabling it is an account-wide step on the shared Cloudflare account, so **wait until Rod confirms he has checked with his brother.**
- **Folders and display names:** stored in **Cloudflare D1** (free SQLite database). Site folders are independent of how files are stored in R2. Outline:
  - `folders(id, area, parent_id, name, sort)`, where `area` is `acoustics` or `electronics`;
  - `items(id, folder_id, r2_key, display_name, file_name, size, content_type, uploaded_at)`;
  - new uploads with no folder show as **Unfiled**.
- **Library pages** (behind Access): a folder tree and file list (name, type, size, date), search, open in the browser (PDFs inline) or download. Simple styling, `site.css`.
- **Admin mode** (same sign-in):
  - **Uploader:** pick or drag files into a folder. Large files are sent **in chunks** using R2 multipart upload (parts of a few MB each), so the Workers 100 MB request limit doesn't matter. Progress is shown per file.
  - **Organising:** create, rename, move and delete folders; move files between folders; rename display names; delete files. Deleting a file removes it from R2 and asks for confirmation in the page first, never with `confirm()`.
- **Electronics projects** may reuse the same mechanism or be written-up pages; decided when built.

## 5. Repositories and local folders
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

## 6. Firebase (one project for the calculators) — ON HOLD
**Decision (2026-11-09): no Firebase and no cloud save until Rod says so. Calculators save and open JSON files only.** Don't create a Firebase project, `cloud.js` or any cloud code. The notes below are kept only as the plan for if and when Rod restarts it.

- **Sign-in:** Firebase Auth with Google. Authorised domains: `calculators.rodrigo.francalacci.com` (where the calculators run), `rodrigo.francalacci.com` (if private website pages are added later), and `localhost`.
- **Access and Firebase do different jobs:** Access decides who can load the pages; Firebase decides whose data is read and saved. Both stay.
- **Firestore layout:**
  - `users/{uid}/apps/{appId}/projects/{projectId}` holds the project metadata (name, ref, client, savedAt, size).
  - Large projects are split, e.g. `.../projects/{projectId}/parts/{partId}`, to stay under Firestore's 1 MiB per document.
- **Security rules:** read and write only when `request.auth.uid == uid`, and only Rod's uid.
- **`cloud.js`** is served by the calculators host at `/shared/cloud.js`, the same origin as the calculators. API in `CALCULATOR-CONTRACT.md` §5.
- **Free plan only** (no card) unless Rod decides otherwise.

## 7. Phases
1. **Website:** repository, domain (`rodrigo` → GitHub Pages) and HTTPS. Done 2026-11-09, except HTTPS, which is waiting for GitHub's certificate.
2. **Calculators behind login:** done 2026-11-09 (Zero Trust Free; Access app "Calculators"; hub and two calculator Workers; every address checked).
3. **Layout:** `shared/site.css`, the sidebar (public and private versions), the placeholder Home and the 404 page. A local preview goes to Rod before anything is published.
4. **Private host:** move to `my.rodrigo.francalacci.com` with redirects from `calculators.rodrigo…`; Access change shown to Rod first.
5. **Libraries:** once Rod confirms R2 may be enabled. Read-only drive first, then admin (uploader, organising).
6. **CV, Contact, electronics calculators, electronics projects:** as Rod is ready. M&E adopts the contract in its own session.
7. **Firebase / cloud save: on hold** until Rod says so (§6).
