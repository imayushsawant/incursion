# Incursion

Next.js (App Router, TypeScript) port of the single-file `Incursion.html` landing page.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Layout

| Path | What it is |
| --- | --- |
| `app/layout.tsx` | `<html>`, metadata, viewport (`viewport-fit=cover`), font preloads |
| `app/globals.css` | The original stylesheet, unchanged apart from fonts pointing at `/fonts/*` |
| `components/Incursion.tsx` | The original markup as JSX, plus the timeline and title-glitch slices (previously built by script) |
| `lib/engine.js` | The original inline script (scroll scene, canvas, audio, intro), logic untouched |
| `lib/timeline.ts` | Schedule data (edit dates/copy here) |
| `lib/config.js` | `REGISTER_URL` (empty = buttons scroll to the schedule) |
| `lib/frames.js`, `lib/jag.ts` | Frame URL list, torn-paper polygon generator |
| `public/` | Fonts, 240 collision frames, throne images, intro video, music track (all extracted from the HTML's base64) |
