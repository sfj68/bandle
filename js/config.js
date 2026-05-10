// ── CONFIGURATION ──────────────────────────────────────
// This is the ONLY file you need to edit to update show data.
//
// LAUNCH_DATE  — the date Day 1 unlocks (YYYY-MM-DD)
// SHOWS        — one entry per show, in order (Day 1, Day 2, …)
//   word        : the answer in ALL CAPS, no spaces (players type this)
//   displayWord : how the answer appears in results (can include spaces)
//   hasSpace    : set true if displayWord has a space
//   spaceAfter  : tile index after which the visual gap appears (0-based)
//   hint        : a single emoji shown when the player uses their hint
//   desc        : description shown after the game ends
//
// MAX_GUESSES  — number of attempts allowed (default 6)
// KEYS         — keyboard layout rows

const LAUNCH_DATE = '2025-05-10';
const MAX_GUESSES = 6;

const SHOWS = [
  {
    word: 'COUNTRY', displayWord: 'COUNTRY', hint: '\u{1F920}',
    desc: "Jack Trice Stadium has welcomed some of the biggest names in country music over the past few years — and now it’s the Cyclone Marching Band’s turn. We’re bringing the big, bold, truck-in-the-mud sound of modern country to the field."
  },
  {
    word: 'SPACE', displayWord: 'SPACE', hint: '\u{1F680}',
    desc: "The Cyclone Marching Band ventures beyond the atmosphere in a show that’s as vast and awe-inspiring as the universe itself. Amaze. Amaze. Amaze."
  },
  {
    word: 'POPHITS', displayWord: 'POP HITS', hasSpace: true, spaceAfter: 3, hint: '\u{1F3B5}',
    desc: "No nostalgia here — this is the stuff that’s dominating the charts right now. The Cyclone Marching Band performs the songs you’ve been streaming on repeat this very season."
  },
  {
    word: 'SILVER', displayWord: 'SILVER', hint: '\u{1F3AC}',
    desc: "The silver screen turns 25! We’re celebrating the iconic films hitting their quarter-century milestone with a show that’s as cinematic as it gets. A silver anniversary deserves a silver performance."
  },
  {
    word: 'MYSTERY', displayWord: 'MYSTERY', hint: '\u{1F50D}',
    desc: "Something’s afoot — but don’t worry, nobody gets hurt. The Cyclone Marching Band presents a lighthearted whodunit full of suspense, surprise, and more than a few laughs along the way."
  },
  {
    word: 'HEROES', displayWord: 'HEROES', hint: '\u{1F9B8}',
    desc: "What do your favorite songs have in common? The word ‘hero.’ The Cyclone Marching Band celebrates the anthems that put heroism front and center — one powerful title at a time."
  },
  {
    word: 'RECYCLE', displayWord: 'RECYCLE', hint: '♻️',
    desc: "The seniors have spoken! Our senior members hand-pick their favorite moments from the season for one last, unforgettable performance together."
  }
];

const KEYS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
  ['⌫','ENTER']
];
