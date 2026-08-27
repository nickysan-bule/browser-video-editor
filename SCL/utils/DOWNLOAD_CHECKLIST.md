# Download Checklist - All Files

Download these 11 files and place them in your project exactly as shown.

## 📥 Main Files (Root of src/)

- [ ] **App.tsx** → `src/App.tsx` (replaces your old App.tsx)
- [ ] **App.module.css** → `src/App.module.css` (new file)

## 📥 Utility Files (src/utils/)

- [ ] **validation.ts** → `src/utils/validation.ts` (new file)
- [ ] **browserCheck.ts** → `src/utils/browserCheck.ts` (new file)
- [ ] **timing.ts** → `src/utils/timing.ts` (new file)

**Note:** Keep your original `src/utils/videoUtils.ts` — don't touch it.

## 📥 Component Files (src/components/)

**Create a new folder called `components` if it doesn't exist yet.**

- [ ] **UploadZone.tsx** → `src/components/UploadZone.tsx` (new file)
- [ ] **StyleControls.tsx** → `src/components/StyleControls.tsx` (new file)
- [ ] **SortableClip.tsx** → `src/components/SortableClip.tsx` (new file)
- [ ] **SortableClip.module.css** → `src/components/SortableClip.module.css` (new file)
- [ ] **ProgressOverlay.tsx** → `src/components/ProgressOverlay.tsx` (new file)
- [ ] **ProgressOverlay.module.css** → `src/components/ProgressOverlay.module.css` (new file)

---

## ✅ After downloading, your folder structure should look like:

```
your-project/
├── src/
│   ├── components/
│   │   ├── UploadZone.tsx
│   │   ├── StyleControls.tsx
│   │   ├── SortableClip.tsx
│   │   ├── SortableClip.module.css
│   │   ├── ProgressOverlay.tsx
│   │   └── ProgressOverlay.module.css
│   ├── utils/
│   │   ├── videoUtils.ts          ← keep your original
│   │   ├── validation.ts          ← NEW
│   │   ├── browserCheck.ts        ← NEW
│   │   └── timing.ts              ← NEW
│   ├── App.tsx                    ← REPLACE (new version)
│   ├── App.module.css             ← NEW
│   ├── main.tsx
│   └── index.css (or similar)
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🎯 That's it!

Once all 11 files are in place, run:

```bash
npm run dev
```

Everything should work. No other changes needed.
