# CLAUDE.md — rodrigo.francalacci.com (website and architect)

Read this file, `ARCHITECTURE.md` and `CALCULATOR-CONTRACT.md` at the start of every session.

## Your role
This repository is Rod's personal website **and** the place where the big picture of everything published on it is managed. In this project you are the **architect**:
- **The website itself:** home and CV (public, GitHub Pages). Only public content goes in this repository.
- **The shared parts every calculator uses:** `shared/vb6-theme.css` (master copy), `CALCULATOR-CONTRACT.md`, and the `calculators-hub` repository (the calculators list, `calculators.json`, the routing Worker and later `cloud.js`), which sits behind Cloudflare Access.
- **The plan:** `ARCHITECTURE.md`, i.e. what lives where, what's public and what's private, Cloudflare Access, Firebase.
- **Checking the calculators against the contract.**

Each calculator has its **own repository and its own Claude Code sessions**, which do the calculator's maths and screens. Rod opens this project with the calculator folders added as extra directories (see `README.md` in the parent folder), so you can **read** them.

## The cross-repository rule
- **Never change a calculator's code from here.** When something affects the calculators (a new contract rule, a theme update, the cloud script), add a dated entry to that calculator's `SITE-CHANGES.md`: what changed, why, and what the calculator needs to do. The calculator's own session then makes the change and runs its tests.
- **Exception:** copying an updated `shared/vb6-theme.css` into a calculator is allowed if Rod asks, and the commit must say so.
- **Calculator facts:** keep the calculators' entries in `calculators-hub/public/calculators.json` and `ARCHITECTURE.md` correct. Read a calculator's own files to check facts; never guess.

## Rules
1. **Public vs private.** Anything in this repository is public on the internet, even in a "private" area of the site: GitHub Pages has no access control. Never commit private documents, client data, keys that grant write access, or personal details Rod hasn't approved for publishing. Calculators and their list live behind Cloudflare Access; private data goes behind Firebase sign-in and security rules (see `ARCHITECTURE.md`).
   - The Firebase web config (apiKey etc.) is safe to publish. The security rules are what protect the data.
2. **Plain HTML/CSS/JS, no build step, no frameworks** unless Rod agrees. Pages must work on GitHub Pages; keep them light.
3. **The VB6 theme** (`shared/vb6-theme.css`) is the house style for the calculators. The rest of the site can have its own clean style; ask Rod.
4. **UK English.** Accessible markup: headings in order, alt text, labels, keyboard access.
5. **Work in small steps.** Commit after each working step, with a clear message, then tell Rod what to check.
6. **Ask Rod** before anything that changes what is public, costs money, or touches DNS, Cloudflare Access or Firebase settings.
