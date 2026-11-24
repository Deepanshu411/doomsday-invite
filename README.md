# DOOMSDAY — You Are Summoned

A cinematic, responsive, dependency-free fan invitation inspired by Avengers: Doomsday. The existing wedding projects in the parent folder are untouched.

## Run locally

From this directory, run npm run dev and open http://localhost:4173. No installation is required. PORT can override the port. npm run check verifies syntax, local files and navigation. npm test runs interaction and HTTP checks. npm run build validates the ready-to-serve dist directory.

## Deploy to Vercel

This site runs entirely in the browser. The checked-in vercel.json selects the Other framework preset, runs npm run build, and publishes dist/ as static files. The local preview server lives at scripts/dev-server.mjs and is not a production function.

Import Deepanshu411/doomsday-invite and use the repository root (leave Root Directory empty). If importing a larger repository that contains doomsday/ as a subfolder, select doomsday as Root Directory instead. The configuration file must be inside the selected root.

Vercel settings: Framework Preset = Other; Build Command = npm run build; Output Directory = dist. No start command, API function, environment variables, or rewrites are needed. Redeploy the commit containing vercel.json. A cached redeploy of an older commit will not include the fix.

For FUNCTION_INVOCATION_FAILED, inspect the deployment runtime logs for the actual exception. A deployment of this static configuration should serve the HTML, JavaScript, images and WAV directly without a function invocation.

## Experience

- Countdown to December 17, 2026 at 00:00 IST (UTC+05:30). This is a release-day milestone, not a claimed screening time.
- Intercepted-transmission intro, ambient particle field, orbital animation, scrolling ticker, scroll reveals, animated Fantastic Four spacecraft and X-vault scan.
- Three source-linked dossiers separating confirmed footage from fan interpretation.
- Optional original 16-second cinematic ambience loop: audible harmonic drone, metallic tones and clock ticks. Native audio playback starts on a tap; no autoplay or copyrighted soundtrack. The button reflects playback success and handles errors. Regenerate the WAV with node scripts/generate-audio.mjs.
- Browser-local traveler name, SVG invitation download and all-day ICS calendar reminder. No ticket booking, RSVP service or server-side personal data.
- Keyboard-accessible modal dialogs, focus indicators and reduced-motion support.
- Type DOOM outside the input for a hidden Latverian protocol.

## Content and assets

The hero banner and Doom promotional poster are downloaded from the official Disney movie page: https://movies.disney.com/avengers-doomsday . Credits and all exact source URLs are in ASSET_SOURCES.json. The spacecraft, vault, emblem and downloadable pass are original vector interpretations. Marvel characters and official art belong to Marvel. This is an unofficial fan project.

The clock target is in dist/app.js. Event copy is in dist/index.html. Colors, animations and breakpoints are in dist/styles.css. The self-contained deployable site is dist/; .openai/hosting.json supplies its private Sites identity.

## Verification

Browser access was unavailable during creation. Automated syntax, file, countdown, dialog, input escaping, audio toggle, download and HTTP tests are provided; actual layout and audible output require a browser review.
