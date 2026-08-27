# 🎯 Complete Setup Guide - All Files

You now have **19 files total**. Follow these steps exactly and you'll have a working project.

---

## 📁 Step 1: Create Your Project Folder

Create a new folder anywhere on your computer. For example:

**Windows:**
```
C:\Users\BULELANI\Documents\browser-video-editor
```

**Mac/Linux:**
```
/Users/bulelani/Documents/browser-video-editor
```

This is your **project root** folder.

---

## 📥 Step 2: Download ALL Files

You should have **19 files** to download:

### **Configuration Files (8 files) — Put in project root:**
```
browser-video-editor/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── index.html
├── .gitignore
└── src/
    ├── main.tsx
    └── index.css
```

### **New Component Files (6 files) — Put in src/components/:**
```
browser-video-editor/src/components/
├── UploadZone.tsx
├── StyleControls.tsx
├── SortableClip.tsx
├── SortableClip.module.css
├── ProgressOverlay.tsx
└── ProgressOverlay.module.css
```

### **Utility Files (4 files) — Put in src/utils/:**
```
browser-video-editor/src/utils/
├── validation.ts
├── browserCheck.ts
├── timing.ts
└── videoUtils.ts (created below)
```

### **App Files (2 files) — Put in src/:**
```
browser-video-editor/src/
├── App.tsx
└── App.module.css
```

---

## 🔧 Step 3: Create videoUtils.ts

You need to create **one more file** called `src/utils/videoUtils.ts`. 

This is your **original video utilities** file. Copy-paste this code:

```typescript
export interface VideoClip {
  id: string;
  file: File;
  name: string;
  duration: number;
  caption: string;
}

export interface CaptionStyle {
  fontSize: number;
  primaryColor: string;
  position: 'bottom' | 'top' | 'middle';
}

export const getClipDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = (err) => reject(err);
  });
};

const formatSRTTime = (seconds: number): string => {
  const pad = (n: number, z = 2) => ('00' + n).slice(-z);
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
};

export const buildSRTManifest = (clips: VideoClip[]): string => {
  let srt = '';
  let currentTime = 0;

  clips.forEach((clip, index) => {
    if (clip.caption.trim().length > 0) {
      const startTime = formatSRTTime(currentTime);
      const endTime = formatSRTTime(currentTime + clip.duration);
      srt += `${index + 1}\n${startTime} --> ${endTime}\n${clip.caption}\n\n`;
    }
    currentTime += clip.duration;
  });

  return srt;
};

export const buildFFmpegStyleParam = (style: CaptionStyle): string => {
  const hex = style.primaryColor.replace('#', '');
  const r = hex.substring(0, 2);
  const g = hex.substring(2, 4);
  const b = hex.substring(4, 6);
  const ffmpegColor = `&H00${b}${g}${r}`;

  const alignments = { bottom: 2, middle: 10, top: 6 };

  return `subtitles=subtitles.srt:force_style='FontSize=${style.fontSize},PrimaryColour=${ffmpegColor},Alignment=${alignments[style.position]},Outline=2,BorderStyle=1'`;
};
```

---

## 📋 Final Folder Structure

After downloading all files, your project should look like this:

```
browser-video-editor/
├── node_modules/              (created after npm install)
├── dist/                       (created after npm run build)
├── src/
│   ├── components/
│   │   ├── UploadZone.tsx
│   │   ├── UploadZone.module.css (if it exists)
│   │   ├── StyleControls.tsx
│   │   ├── SortableClip.tsx
│   │   ├── SortableClip.module.css
│   │   ├── ProgressOverlay.tsx
│   │   └── ProgressOverlay.module.css
│   ├── utils/
│   │   ├── videoUtils.ts       (create this)
│   │   ├── validation.ts
│   │   ├── browserCheck.ts
│   │   └── timing.ts
│   ├── App.tsx
│   ├── App.module.css
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── index.html
└── .gitignore
```

---

## 🚀 Step 4: Install Dependencies

Open terminal in your project folder and run:

```bash
npm install
```

This takes 1-2 minutes. You'll see it download all the libraries.

---

## ✅ Step 5: Run the Project

```bash
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

Open that URL in your browser. Your video editor should load! 🎉

---

## 📋 Quick Checklist

- [ ] Created project folder
- [ ] Downloaded all 19 files into the right folders
- [ ] Created `src/utils/videoUtils.ts` (copy-paste the code above)
- [ ] Folder structure matches the diagram above
- [ ] Ran `npm install` (took 1-2 minutes)
- [ ] Ran `npm run dev`
- [ ] Opened `http://localhost:5173/` in browser
- [ ] Video editor loaded successfully ✅

---

## 🎯 That's It!

You now have a complete, production-ready video editor with:
✅ File validation (stops 2GB uploads)
✅ Browser compatibility check (WASM detection)
✅ Real-time progress overlay (2+ min processing)
✅ Double-click prevention (button disabled)
✅ Mobile responsive design (works on phones)

---

## ⚠️ Common Issues

**"npm: command not found"**
→ Install Node.js from https://nodejs.org/

**"Cannot find module"**
→ Check folder structure matches exactly

**"Port 5173 is already in use"**
→ Run: `npm run dev -- --port 5174`

**"CSS not applying"**
→ Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`

---

## 🎉 Next Steps

Once it's working:
1. Test uploading a video clip
2. Add a caption
3. Click "Export Video"
4. Watch the progress overlay
5. Download your video

Enjoy! 🚀
