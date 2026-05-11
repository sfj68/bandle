# Bandle

A Wordle-style guessing game for the ISU Cyclone Marching Band (ISUCF'V'MB). One new puzzle unlocks each day — 365 marching band and Iowa State themed words. Players guess the word in 6 tries.

Live at: https://bandle.iastate.band

## Updating the word list

The daily words live in **`js/words.js`**. Each entry is a `[WORD, HINT_EMOJI]` pair:

```js
['MARCH', '🎵'],
['CYCLONE', '🌪️'],
```

- **WORD** — the answer in ALL CAPS, no spaces
- **HINT_EMOJI** — shown when the player uses their hint on their last guess

Day 1 = first entry, Day 2 = second, etc. To add more days, append entries to the end of the array.

### Hint emoji guide

| Emoji | Category |
|-------|----------|
| 🎵 | Music term |
| 🎺 | Brass instrument |
| 🎷 | Woodwind |
| 🥁 | Percussion |
| 🏟️ | Gameday / football |
| 🌪️ | ISU / Cyclone |
| 🚩 | Color guard |
| ⭐ | Band culture |
| 🎭 | Performance |
| 🎯 | Drill / marching |
| 🎹 | Keyboard / other instrument |
| 🎶 | Music genre |

## Changing the launch date

Edit `LAUNCH_DATE` in **`js/config.js`**. Day 1 unlocks on that date, Day 2 the next day, and so on.

```js
const LAUNCH_DATE = '2026-05-10';
```

## Deployment

This site auto-deploys via Vercel when you push to `main`:

1. Edit files on GitHub (or locally)
2. Commit and push to `main`
3. Vercel rebuilds and deploys automatically (takes ~10 seconds)

No build step, no dependencies — Vercel serves the static files directly.

## Admin page

Visit `/admin.html` on the live site to edit words, hints, and descriptions in the browser.

1. Create a [fine-grained GitHub token](https://github.com/settings/tokens?type=beta) with **Contents: Read and write** access to the bandle repo
2. Paste the token on the admin page (stored in your browser only)
3. Click **Load Words** to fetch the current list
4. Edit words, hints, or descriptions inline
5. Click **Save & Deploy** — commits to GitHub and Vercel auto-deploys

## Local development

Open `index.html` in a browser. That's it — no server, no build tools needed.

## Project structure

```
bandle/
├── index.html       # page structure
├── css/
│   └── style.css    # all styles
├── js/
│   ├── config.js    # launch date, max guesses, keyboard layout
│   ├── words.js     # 365 daily words with hint emojis
│   └── game.js      # game logic (you shouldn't need to touch this)
├── .gitignore
└── README.md
```
