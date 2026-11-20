# Chapter & Co. — Responsive eCommerce Bookstore

A front-end bookstore demonstration built with **HTML5, CSS3 and vanilla JavaScript**. No framework or build step is required.

## Features
- Responsive desktop, tablet and mobile layout
- Book catalogue and category filters
- Search by title, author or category
- Sort by price and rating
- Wishlist add/remove
- Shopping cart with quantity updates and subtotal
- Cart and wishlist saved in the browser (`localStorage`)
- Free-delivery threshold messaging
- Newsletter form interaction

> Demo only: checkout does not process payments, and no order is created or stored. Cart and wishlist are saved in your browser (see [Saved Data and Persistence](#saved-data-and-persistence)), but a production store would still need a backend/API, accounts, authentication and payment integration.

## Saved Data and Persistence

Your cart and wishlist are saved in the browser using `localStorage`, so they are still there after you refresh the page or come back later in the same browser.

- **What is stored:** one entry, `chapterco:bookstore:v1`, holding only book IDs and quantities. For example: `{"v":1,"cart":[{"id":1,"qty":2}],"wishlist":[3,7]}`.
- **What is not stored:** prices, titles, authors, covers and other book details are never saved. They are rebuilt from the book catalogue in `script.js` every time the page loads, so a saved cart always shows current catalogue prices.
- **Not persisted:** search text, sort order, the selected category and the wishlist-only view always start fresh after a refresh.
- **Saved data is checked on load:** unknown book IDs, duplicates and invalid entries are ignored, and quantities are capped at 10 per book. If the saved data is damaged or from an unsupported version, the store starts empty and the bad data is replaced the next time you change your cart or wishlist.
- **Open tabs stay in step:** a change in one tab of the same browser appears in the others. If two tabs change at the same moment, the last change saved wins.
- **If storage is unavailable** (for example blocked by browser settings, a private mode or a full quota), the store keeps working in memory. A short notice appears the first time a change cannot be saved, and the cart and wishlist are lost when the page is closed or refreshed.
- **Clearing saved data:** clear this site's data in your browser settings.

### Opening `index.html` directly (`file://`)

Persistence is most dependable from a web server. Browsers treat pages opened from disk (`file://`) differently from each other, so saving may not work the same way, or at all, when you double-click `index.html`.

- Some browsers share one storage area across all local files, which means other local pages could read or overwrite it. The app validates everything it loads for this reason.
- Other browsers may keep each local file separate, or block storage for `file://` pages.
- This has so far been checked only in Microsoft Edge (headless). Other browsers are untested.

For dependable persistence, serve the folder from a stable address, for example:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8000/`. Use the same address every time: storage is kept separately for each address and port, so `localhost:8000` and `127.0.0.1:8000` have separate saved data. A hosted site (for example GitHub Pages) over HTTPS works the same way.

> Checkout is still a demo. It does not take payment, create an order or clear your saved cart.

## Run locally
1. Extract the project folder.
2. Open the folder in IBM Bob.
3. Open `index.html` in a browser, or use a local preview extension for auto-refresh.

## Files
- `index.html` — page structure and content
- `styles.css` — visual design and responsive breakpoints
- `script.js` — book data, search, filters, wishlist, cart interactions and saved-data handling

## IBM Bob prompts (use one at a time)

### 1. Understand the project — do not edit
```text
Analyze this vanilla HTML, CSS and JavaScript bookstore project.
Explain the page structure, responsive breakpoints, JavaScript state,
event handling, and user flows. Do not modify files yet. List bugs,
accessibility gaps, and a prioritized improvement plan.
```

### 2. Improve mobile navigation
```text
Review the mobile navigation. Check keyboard accessibility, menu
toggle behavior, aria-expanded state, and layout at mobile/tablet widths.
Explain your plan first, then make only necessary changes.
```

### 3. Code review
```text
Review index.html, styles.css and script.js for maintainability,
accessibility, performance, responsive behavior and potential bugs.
Do not edit yet. Return findings with severity and file names.
```

### 4. Persist cart and wishlist
```text
Add localStorage persistence for the shopping cart and wishlist.
Keep the existing HTML, CSS and vanilla JavaScript approach.
Handle invalid stored data safely. Explain the plan, implement it,
and tell me how to test persistence after refresh.
```

### 5. Validate user flows
```text
Create and execute a manual test checklist for search, category
filtering, sorting, wishlist add/remove, cart add/remove, quantity
updates, subtotal, mobile navigation and newsletter validation.
Fix only confirmed issues and summarize the changes.
```

### 6. GitHub readiness
```text
Review this project before GitHub submission. Check relative file paths,
README instructions, responsive layout, and ensure no secrets are present.
Do not claim tests passed unless they were actually run.
```

## Upload to GitHub
Create a repository, for example `responsive-bookstore-html-css-js`, then open a terminal in this folder and run:

```bash
git init
git add .
git commit -m "Build responsive bookstore with HTML CSS and JavaScript"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/responsive-bookstore-html-css-js.git
git push -u origin main
```
Replace `YOUR-USERNAME` with your GitHub username.
