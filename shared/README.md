# shared/

Files every page and calculator can use from `https://rodrigo.francalacci.com/shared/...`.

- `vb6-theme.css`: the VB6 house style. **The master copy**: calculators keep their own copy
  (so they work offline) and are told through `SITE-CHANGES.md` when this one changes.
- `style-demo.html`: every component of the theme, with the markup to copy.
- `cloud.js`: later. Firebase sign-in and Save/Open for calculators; see `../CALCULATOR-CONTRACT.md` §5.
