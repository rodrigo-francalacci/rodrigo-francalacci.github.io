# Architecture — rodrigo.francalacci.com

Status: first draft. Items marked **[DECIDE]** are Rod's open decisions.

## 1. Hosting and addresses
- **Hosting:** GitHub Pages.
- **The website repository** is `<github-username>.github.io` (folder `website/` locally). It has the custom domain `rodrigo.francalacci.com` (the `CNAME` file).
- **DNS:** at the provider for francalacci.com, a **CNAME** record with host `rodrigo` and value `<github-username>.github.io`. Then GitHub → Settings → Pages: custom domain plus "Enforce HTTPS".
- **Project sites:** GitHub publishes every other repository of the account that has Pages turned on **under the same domain**, at `/<repository-name>/`. Calculators are therefore never copied here; each one publishes itself:

| Address | Repository | What |
|---|---|---|
| `/` | `<github-username>.github.io` | Home |
| `/cv/` | same | CV (public version) |
| `/calculators/` | same | List of calculators, from `calculators.json` |
| `/shared/` | same | `vb6-theme.css`, later `cloud.js` |
| `/crosstalk-calculator/` | `crosstalk-calculator` | Crosstalk DnT,w Calculator |
| `/mne-noise-calculator/` | `mne-noise-calculator` | M&E Noise Calculator |

## 2. Public and private
- **Everything served by GitHub Pages is public**, including JavaScript "login" pages. The files are still downloadable.
- **Private content** (documents, private CV versions, saved calculator projects) lives in **Firebase**, readable only after sign-in, with security rules allowing only Rod's account. The pages that show it are public shells that load the data after sign-in.
- **[DECIDE] Calculators public or private?**
  - Their code would be public on GitHub Pages, and they contain work methods and manufacturer data. Check with Stroma whether publishing is acceptable.
  - If the calculators must be private, move hosting for those paths to **Cloudflare Pages + Cloudflare Access**. That puts a real login in front of whole paths; the free tier allows up to 50 users, and it can deploy from the same GitHub repositories.
  - Until decided, keep the calculators' GitHub repositories private and their Pages off. Note that Pages for a private repository requires a paid GitHub plan, and the site would still be public.

## 3. Firebase (one project for the whole site) — later phase
- **Sign-in:** Firebase Auth with Google. Add `rodrigo.francalacci.com` (and `localhost` for testing) to the authorised domains. Every calculator is on the same origin, so one sign-in covers all of them.
- **Firestore layout:**
  - `users/{uid}/apps/{appId}/projects/{projectId}` holds the project metadata (name, ref, client, savedAt, size).
  - Large projects are split, e.g. `.../projects/{projectId}/parts/{partId}`, to stay under Firestore's 1 MiB per document.
  - Images, if wanted, are resized in the browser and stored as their own documents.
- **Security rules:** read and write only when `request.auth.uid == uid`, and only Rod's uid.
- **`shared/cloud.js`:** the one script calculators load for cloud save. API in `CALCULATOR-CONTRACT.md` §5.
- **Free plan only** (no card) unless Rod decides otherwise.

## 4. Repositories and local folders
```
Code/francalacci-site/          (parent folder, not a repository)
  website/                      → <github-username>.github.io   (architect: this project)
  calculator-template/          → calculator-template (GitHub "template repository")
  crosstalk-calculator/         → crosstalk-calculator
  mne-noise-calculator/         → mne-noise-calculator
```
To add a calculator:
1. Click **Use this template** on `calculator-template`.
2. Clone it next to the others and build it in its own Claude Code sessions.
3. Turn Pages on.
4. Add one entry to `calculators.json`.

## 5. Phases
1. Website repository, domain and HTTPS; a simple home page and the calculators page.
2. Crosstalk repository published (or kept private, per §2); check `/crosstalk-calculator/`.
3. `calculator-template` on GitHub as a template repository; the M&E calculator adopts the contract.
4. Firebase project, `shared/cloud.js`, security rules; Save/Open in the crosstalk calculator first.
5. Private areas (documents, private CV) on Firebase; or Cloudflare Access, per §2.
