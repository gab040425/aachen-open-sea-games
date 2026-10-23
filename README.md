# Aachen Open: SEA Games — website

The website for the **Aachen Open: SEA Games** (5–6 December 2026, Aachen): a sports weekend for the Vietnamese, Indonesian and Malaysian student communities.

This README explains, without assuming any web experience:

1. [What this project is made of](#1-what-this-project-is-made-of)
2. [Where to find what](#2-where-to-find-what) (folder map + "I want to change X" table)
3. [Installation](#3-installation-one-time)
4. [Working on the site (dev)](#4-working-on-the-site-dev)
5. [Testing before you publish](#5-testing-before-you-publish)
6. [Deploying (putting it online)](#6-deploying-putting-it-online)
7. [Common problems](#7-common-problems)

---

## 1. What this project is made of

| Word | What it means here |
|---|---|
| **React** | The tool the site is built with. The page is split into small pieces called **components** (the navigation bar, the hero, the FAQ, …). Each one lives in its own file, so you only open the piece you want to change. |
| **Component** | One piece of the page. A `.js` file holds its **content and structure**, a `.css` file next to it holds its **look** (sizes, spacing). |
| **CSS variables** | All colours and fonts are defined **once** at the top of `src/App.css` (e.g. `--lunar-yellow`). Everything else refers to them, so changing one line re-colours the whole site. |
| **Data files** | Lists of content (sports, merch, FAQ-like info, countdown dates, clubs) live in `src/data/`. You can edit text there without touching any layout. |
| **Vite** | The program that runs the site on your computer while you work, and packs it into final files for the internet. |
| **npm / Node.js** | Node.js runs JavaScript tools on your computer; npm (comes with it) installs the libraries the project needs and runs the commands below. |
| **Terminal** | The text window where you type commands (macOS: app "Terminal"; Windows: "PowerShell"; or the terminal panel inside VS Code). |

The site has **three kinds of pages**: the home page (`/`), one page per sport (`/sports/chess`, …) and the merch shop (`/merchandise`). Switching between them happens in the browser, without a server (this is what *React Router* does).

The animated blue background with the ripples is drawn by the computer's graphics chip (WebGL). If a device can't do that, a plain CSS gradient is shown instead, so nothing ever breaks.

---

## 2. Where to find what

### Folder map

```
react/
├── README.md                ← this file
├── index.html               ← the single HTML page the browser loads (title, description, tab icon)
├── package.json             ← list of libraries + the commands (dev, build, …)
├── vite.config.js           ← settings for Vite (you normally never touch this)
│
├── public/                  ← files copied to the website as they are
│   ├── _redirects           ← tells Netlify to always load the app (needed for /sports/... links)
│   └── images/              ← ALL PICTURES go here (photos, logos, cut-outs)
│       └── opt/             ← automatic web-sized copies (made by a script, don't edit)
│
├── image-originals/         ← full-size originals, kept for safety (not used by the site)
├── scripts/
│   └── optimize-images.mjs  ← makes the web-sized copies in public/images/opt/
│
└── src/                     ← the actual website
    ├── index.js             ← starting point (loads fonts and the app)
    ├── fonts.js             ← which fonts are loaded
    ├── App.js               ← the frame of every page: background, nav bar, page, footer
    ├── App.css              ← COLOURS, FONTS and shared styles (buttons, titles, …)
    │
    ├── pages/               ← whole pages
    │   ├── HomePage.js      ← the order of the sections on the home page
    │   ├── SportPage/       ← the page for one sport (/sports/…)
    │   └── MerchPage/       ← the merch shop (/merchandise)
    │
    ├── components/          ← the building blocks (one folder each: .js = content, .css = look)
    │   ├── Navbar/          ← top bar with logo and links
    │   ├── Hero/            ← big title area at the top, players, countdown
    │   ├── Countries/       ← Vietnam / Indonesia / Malaysia cards
    │   ├── EventInfo/       ← date, location, venue photo
    │   ├── About/           ← "About the Event"
    │   ├── Organizers/      ← "Organised by" (the three clubs)
    │   ├── Sports/          ← the sport cards on the home page
    │   ├── Merch/           ← the merch cards on the home page
    │   ├── Faq/             ← questions and answers
    │   ├── Footer/          ← bottom bar (copyright, links)
    │   ├── Countdown/       ← the countdown boxes (used in hero, merch)
    │   ├── Carousel/        ← the image slider on the merch page
    │   ├── SectionLabel/    ← the "// LABEL ———" divider above each section
    │   ├── ImageSlot/       ← shows a picture (or a dashed placeholder if it's missing)
    │   ├── DitherWave/      ← settings of the animated background
    │   ├── Icon/            ← small line icons (calendar, pin, arrow, …)
    │   └── ScrollToHash/    ← scrolls to the right section when you click a menu link
    │
    ├── data/                ← CONTENT LISTS (edit text here)
    │   ├── sports.js        ← sports: names, photos, rules, requirements
    │   ├── merch.js         ← jersey & t-shirt: price, story, sizes, photos, order link
    │   ├── countdowns.js    ← all countdown dates (registration, presale, tournament)
    │   ├── clubs.js         ← the three organising clubs (SVA, PPI, MAK)
    │   └── image-manifest.json ← automatic list of image sizes (don't edit)
    │
    └── lib/                 ← technical engine code (normally no need to touch)
        ├── dither-wave.js   ← draws the animated background
        └── ticker.js        ← one shared animation clock
```

### "I want to change …"

| I want to change … | Open this file | Look for |
|---|---|---|
| A **colour** anywhere on the site | `src/App.css` | the `:root { … }` block at the top (`--burgundy`, `--lunar-yellow`, …) |
| The **background gradient** colours | `src/App.css` | `--bg-deep`, `--bg-navy`, `--bg-royal`, `--bg-bright`, `--bg-glow-…` |
| A **font** | `src/App.css` (`--font-heading`, `--font-body`, …) **and** `src/fonts.js` | |
| The **title / tagline / intro** at the top | `src/components/Hero/Hero.js` | |
| A **countdown date** (or add a new countdown) | `src/data/countdowns.js` | `date: '2026-11-01T00:00:00+01:00'` |
| **Register** button link | `src/components/Hero/Hero.js` and `src/components/Navbar/Navbar.js` | `href="#"` next to "Register" |
| **Menu links** in the top bar | `src/components/Navbar/Navbar.js` | the `links` list at the top |
| **Event facts** (date, location, …) | `src/components/EventInfo/EventInfo.js` | the `facts` list |
| **"About the Event"** text | `src/components/About/About.js` | |
| The **organising clubs** (name, description, logo, link) | `src/data/clubs.js` | |
| A **sport** (add/remove, text, rules, photo) | `src/data/sports.js` | copy one `{ … }` entry to add a sport |
| **Merch** (price, story, size chart, photos, Google Form link) | `src/data/merch.js` | `formUrl`, `price`, `story`, `sizes`, `images` |
| **FAQ** questions and answers | `src/components/Faq/Faq.js` | the `questions` list |
| **Footer** links (Instagram, Contact, …) | `src/components/Footer/Footer.js` | `href="#"` |
| The **order of sections** on the home page | `src/pages/HomePage.js` | |
| The **browser tab title** / Google description | `index.html` | `<title>` and `<meta name="description">` |
| How the page looks **on phones** | the component's `.css` file | the block starting with `@media (max-width: 860px)` |
| The **animated background** (strength, ripples, "SEA GAMES" islands) | `src/components/DitherWave/DitherWave.js` | the `settings` and `islands` values |

> **Tip:** In VS Code, press `Cmd+Shift+F` (Mac) / `Ctrl+Shift+F` (Windows) and search for a piece of text you see on the website. It will show you the exact file.

### Pictures

1. Put the picture in `public/images/` (e.g. `Merch-Jersey-1.jpg`).
2. Use **exactly** the file name the code expects (capital letters matter). Until a picture exists, the site shows a dashed box saying which file is missing, e.g. *"add public/images/Club-Vietnam.png"*.
3. That's it. Web-sized copies are made automatically when you run `npm run dev` or `npm run build`.

Good to know:
- Export photos at about **1600 px wide, JPG**. Straight-from-camera files (5–15 MB) work, but are wasteful.
- Logos and cut-out players need a **transparent background → PNG**.
- Pictures that are still missing: `Club-Vietnam.png`, `Club-Indonesia.png`, `Club-Malaysia.png` (club logos) and `Merch-Jersey-1…4.jpg`, `Merch-Tshirt-1…4.jpg` (merch photos).

---

## 3. Installation (one time)

You need:
- **Node.js 20 or newer**: download the "LTS" version from [nodejs.org](https://nodejs.org) and install it like any program.
- **Git** (to download the project): [git-scm.com](https://git-scm.com). macOS usually has it already.
- A code editor, e.g. **VS Code**: [code.visualstudio.com](https://code.visualstudio.com).

Then open a terminal and run, line by line:

```bash
# 1. download the project (skip if you already have the folder)
git clone https://github.com/gab040425/aachen-open-sea-games.git
cd aachen-open-sea-games

# 2. install the libraries the project needs (takes a minute; creates a node_modules/ folder)
npm install
```

To check that Node is installed, run `node -v`. It should print `v20…` or higher.

---

## 4. Working on the site (dev)

```bash
npm run dev
```

The terminal prints an address like **http://localhost:5173**. Open it in your browser.

- Every time you **save** a file, the browser updates by itself.
- Stop it with `Ctrl + C` in the terminal.
- The first start also prepares the web-sized pictures (a few seconds).

**See it on your phone:** run `npm run dev -- --host` instead. The terminal now also shows a "Network" address (e.g. `http://192.168.0.12:5173`). Type that into your phone's browser. The phone must be on the **same Wi-Fi** as the computer.

---

## 5. Testing before you publish

There are no automatic tests. Instead, do these three checks:

1. **Does it build?**
   ```bash
   npm run build
   ```
   This makes the final website in a `dist/` folder. If something is broken (e.g. a typo in a file), it stops with a red error naming the file and line. "✓ built in …" means all good.

2. **Does the final version work?**
   ```bash
   npm run preview
   ```
   Opens the *built* site (the exact files that will go online) at an address like http://localhost:4173.

3. **Click through it**, on a computer and a phone:
   - [ ] no dashed "add public/images/…" boxes left (unless intended)
   - [ ] all menu links work, including after reloading a sport page
   - [ ] Register / Order buttons go to the right forms
   - [ ] countdowns show the right dates
   - [ ] no `[Write this here]` / `[Price]` / `[Year]` placeholders left

---

## 6. Deploying (putting it online)

The project is ready for **Netlify** (free). Two ways:

### A. Automatic (recommended): connect GitHub
Every change pushed to GitHub goes online by itself.

1. Log in at [app.netlify.com](https://app.netlify.com) (you can sign in with GitHub).
2. **Add new site → Import an existing project → GitHub** → choose `aachen-open-sea-games`.
3. Use these settings (usually filled in automatically):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy**. After a minute you get a link like `something.netlify.app`.
5. From now on: save your changes, then
   ```bash
   git add .
   git commit -m "describe what you changed"
   git push
   ```
   Netlify rebuilds and updates the site automatically.

### B. Manual: drag and drop
1. Run `npm run build`.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the **`dist`** folder (not the whole project!) onto the page.
3. To update later: build again and drag the new `dist` folder onto your site's **Deploys** tab.

**Own domain (optional):** in Netlify go to *Domain management → Add a domain* and follow the steps; HTTPS is set up automatically.

**Other hosts** (Vercel, Cloudflare Pages, GitHub Pages) work the same way: build command `npm run build`, output folder `dist`. One extra step is needed there: make every address load `index.html`. On Netlify, `public/_redirects` already does this. Without it, reloading a page like `/sports/chess` shows "Page not found".

---

## 7. Common problems

| Problem | Fix |
|---|---|
| `npm: command not found` | Node.js isn't installed (or the terminal was opened before installing). Install it, then open a new terminal. |
| `vite: command not found` / "Cannot find module" | Run `npm install` in the project folder first. |
| The site doesn't change after editing | Make sure the file is **saved** and `npm run dev` is still running. Then reload the browser. |
| A picture shows a dashed box | The file is missing or its name differs (check capital letters and `.jpg` vs `.png`). |
| Reloading `/sports/…` online shows "Page not found" | The host isn't sending every address to `index.html`. See the last paragraph of section 6. |
| `npm run build` shows a red error | Read the file name and line number it mentions. Usually a missing quote `'`, comma `,` or bracket `}` in a data file. |
| The background is a plain gradient, no ripples | The device or browser can't run WebGL, or "reduce motion" is on in the system settings. That's intended. |
