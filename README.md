# EnCoder

EnCoder teaches Python, HTML and CSS to Portuguese speakers, one short lesson at a time. A mascot
teacher explains each English word in the code, and students practise with multiple choice, fill
in the blank, put the lines in order, write the code, and fix a broken machine. XP, ranks, streaks,
a daily mission with a reward chest, a review mode for past mistakes and a dictionary of learned
words keep them coming back.

It is a static site: plain HTML, CSS and JavaScript modules with no build step.
Firebase Authentication handles accounts, and each student's progress is one Firestore document.
Python runs in the browser with [Skulpt](https://skulpt.org/).

## Run it locally

Serve the repository root with any static file server and open `login.html`:

```sh
python3 -m http.server 8000
# http://localhost:8000/login.html
```

The site talks to the real Firebase project (`encoding-c67fb`), so accounts you create locally
are real accounts. Add `localhost` under Authentication > Settings > Authorized domains if
sign-in is refused.

## Project layout

| Path | What it holds |
| --- | --- |
| `*.html` | One page each: login, sign-up, dashboard, lesson map (`lessons.html`) and the lesson player (`lesson.html`) |
| `js/content/` | The lessons for each track. The format is described at the top of `js/content.js` |
| `js/lesson.js` | The lesson player: steps, exercises, feedback and the end-of-lesson celebration |
| `js/grading.js` | How answers are checked: Python by its output, HTML by its parsed tree, CSS by resolved values |
| `js/progress.js` | Loading and saving a student's progress |
| `js/game.js`, `js/xp.js` | Ranks, daily missions, the chest, and how much XP each lesson pays |
| `firestore.rules` | Who may read and write what. Each student can only touch their own `users/{uid}` |
| `vendor/` | Third-party code served from this site (Skulpt), in folders named after their version |
| `tests/` | Content and security-rule tests, with their own `package.json` |

## Adding or changing lessons

Edit the track file in `js/content/` and run the content test. It plays every exercise through
the same grader students use, so it catches a solution that does not pass, a broken machine
that already works, a teach example whose output is wrong, or a lesson that would pay more XP
than the security rules accept in one save.

## Tests

```sh
cd tests
npm ci
npx playwright install chromium   # once
npm run test:content              # lesson content, in a headless browser
npm run test:rules                # Firestore rules, on the emulator (needs Java 21)
```

Both run on every push and pull request (`.github/workflows/test.yml`).

## Deploying

- **Site:** Cloudflare Pages publishes every push to `main`. `_headers` sets caching and security headers.
- **Firestore rules:** `.github/workflows/deploy.yml` tests and publishes them when they change.
  It needs the repository secret `FIREBASE_SERVICE_ACCOUNT`, a JSON key for a service account on
  `encoding-c67fb` with the *Firebase Rules Admin* and *Service Usage Consumer* roles.

## How progress is saved

A finished lesson is saved in one Firestore transaction, so two tabs or devices cannot overwrite
each other. If the save fails (for example, offline), the result waits in `localStorage` and is
sent the next time any page loads. If progress cannot be loaded, the page shows a retry screen
rather than an empty account, so nothing is ever saved on top of missing data. A lesson in
progress is kept in `sessionStorage`, so reloading the page continues where the student stopped.
