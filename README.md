# Student Clock

Classroom-first countdown clock for tests and exams. The countdown is intentionally dominant for distance visibility, with a secondary split-screen panel for rules and exam context.

## Features

- Large, high-contrast countdown display
- Default clock-only mode with toggleable split-screen details panel
- Teacher setup form for course, exam title, rules, duration/end-time, and options
- URL-based setup sharing via query parameters
- Pause/resume, add/subtract time, and reset controls
- Presentation lock mode that hides controls until unlocked
- Optional end-of-time audio beep and clear visual alert state
- Last setup persistence in browser `localStorage`
- Static deployment to GitHub Pages

## Quick Start

```bash
npm install
npm run dev
```

Open the local URL from Vite in your browser.

## Build and Preview

```bash
npm run build
npm run preview
```

## Tests

```bash
npm run test
```

## URL Parameters

The app reads these query parameters at load time:

- `course` (`string`)
- `exam` (`string`)
- `rules` (`string`)
- `duration` (`number`, minutes)
- `end` (`ISO datetime`)
- `beep` (`1` or `0`)
- `split` (`1` or `0`)
- `showTimes` (`1` or `0`)

Example:

```text
?course=CHEM%20101&exam=Midterm&duration=90&split=0&beep=1
```

## GitHub Pages Deployment

Deployment is automated via `.github/workflows/deploy.yml` on pushes to `main`.

After enabling Pages for the repository (Build and deployment: GitHub Actions), every push to `main` will publish the latest build.
