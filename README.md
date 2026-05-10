# Bandle

A Wordle-style guessing game for the ISU Cyclone Marching Band (ISUCF'V'MB) show schedule. One new show unlocks each day starting from the launch date. Players guess the show name in 6 tries.

Live at: _[add your Netlify URL here]_

## Updating show data

All show configuration lives in **`js/config.js`** — that's the only file you need to edit.

### Changing show descriptions or hints

Find the `SHOWS` array. Each entry looks like this:

```js
{
  word: 'COUNTRY',        // answer players type (ALL CAPS, no spaces)
  displayWord: 'COUNTRY', // how the answer displays in results
  hint: '🤠',             // emoji shown when the player uses their hint
  desc: "Description…"    // shown after the game ends (win or lose)
}
```

To update a description, edit the `desc` string. To change a hint emoji, edit the `hint` string.

### Adding a show with a space in the name

If the display name has a space (like "POP HITS"), add two extra fields:

```js
{
  word: 'POPHITS',          // no space — this is what the player types
  displayWord: 'POP HITS',  // display version with the space
  hasSpace: true,            // tells the grid to insert a visual gap
  spaceAfter: 3,             // gap appears after tile index 3 (0-based)
  hint: '🎵',
  desc: "Description…"
}
```

### Changing the launch date

Edit `LAUNCH_DATE` at the top of the file. Day 1 unlocks on that date, Day 2 the next day, and so on.

```js
const LAUNCH_DATE = '2025-05-10';
```

## Deployment

This site auto-deploys via Netlify when you push to `main`:

1. Edit `js/config.js` on GitHub (or locally)
2. Commit and push to `main`
3. Netlify rebuilds and deploys automatically (takes ~30 seconds)

No build step, no dependencies — Netlify serves the static files directly.

## Local development

Open `index.html` in a browser. That's it — no server, no build tools needed.

## Project structure

```
bandle/
├── index.html       # page structure
├── css/
│   └── style.css    # all styles
├── js/
│   ├── config.js    # show data, launch date, keyboard layout
│   └── game.js      # game logic (you shouldn't need to touch this)
├── .gitignore
└── README.md
```
