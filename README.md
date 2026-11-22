# Sabaq Study Desk

A homework helper for students, with the page in English, العربية, Español, اردو, हिन्दी, বাংলা, Français and 中文.

**Open the app: https://sabaq-study.pages.dev**

**Install it on your phone, tablet or computer: https://sabaq-study.pages.dev/setup/**

## What it does

- Homework list with tickboxes, due dates and reminders
- A schedule of what is due each day: tap a day to see it and set goals for it
- Help with any assignment, including from a photo: step by step, hints, check my work, improve, practice, summary or translate
- An English translation under any answer, or under every answer
- Study plans, flashcards and quizzes made from a topic or class notes
- A focus timer with your own focus and break lengths, counting minutes per assignment
- Read-aloud and voice typing, using the browser's own speech features

It is free and needs no account. Your homework stays in your own browser on your device.

The app is hosted on Cloudflare Pages (project `sabaq-study`). This repo holds its source; GitHub Pages also serves a copy at https://albaraaroury190-tech.github.io/sabaq/.

## The free AI helper

On this website, answers come from an open AI model (Google's Gemma 4) running on Cloudflare Workers AI, through the small worker in `worker/`. The site has a daily limit so it stays within Workers AI's free allowance; when it is reached, the page asks students to try again the next day. Each address can ask 8 questions a minute.

To deploy the worker: `cd worker && npx wrangler deploy`. The pages allowed to use it and the daily limit are in `worker/wrangler.toml`.

## Files

- `index.html`: the whole app in one file, with no build step
- `setup/`: the setup page, with an Install button, steps for each device and a QR code
- `manifest.webmanifest`, `sw.js` and `icons/`: let the app be installed and work offline
- `worker/`: the free AI helper on Cloudflare Workers
