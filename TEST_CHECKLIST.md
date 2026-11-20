# Phase 0: Baseline and Safety Net Report

Baseline validation of the existing Chapter & Co. bookstore before any improvements. No application files (`index.html`, `styles.css`, `script.js`) were modified during testing. The test harness and Chrome headless ran on a temporary copy, which was deleted afterwards.

**Limits of this baseline:**
- Screenshots could not be viewed, so the responsive results are layout measurements taken in the browser, not visual inspection.
- Visual polish, real touch input and screen-reader behavior are marked **Manual** because they could not be verified.

---

## 1. .gitignore check

**Status: CREATED and verified.** The `.gitignore` file now exists in the project root (149 bytes).

At baseline there was no `.gitignore` and no `.git` repository (`git status` reported "not a git repository"). Without one, OS and editor files (`.DS_Store`, `Thumbs.db`, `.vscode/`) and any future `.env` would be committed after the README's `git init` and `git add .` steps.

An earlier attempt to create `.gitignore` with the file tool was blocked ("Access denied: matches an ignore pattern (.bobignore or .gitignore)"). The file was later created outside that attempt, and its contents were checked by reading it back:

```gitignore
# OS files
.DS_Store
Thumbs.db

# Editor and IDE settings
.vscode/
.idea/

# Logs
*.log

# Environment variables and secrets
.env
.env.*
```

| Category | Entries | Present |
|---|---|---|
| OS files | `.DS_Store`, `Thumbs.db` | Yes |
| IDE and editor files | `.vscode/`, `.idea/` | Yes |
| Logs | `*.log` | Yes |
| Environment secrets | `.env`, `.env.*` | Yes |

---

## 2. Manual testing checklist

Result key: **Pass** = verified in headless Chrome at 360px and 1024px. **Fail** = defect confirmed. **Manual** = needs a human with a real browser or device.

### A. Search
| ID | Step | Expected | Result |
|---|---|---|---|
| S1 | Type `clean` | Only Clean Code shows | Pass |
| S2 | Type `PAULO` | The Alchemist shows (author match, case-insensitive) | Pass |
| S3 | Type a category, e.g. `fiction` | Fiction titles show | Pass (by code review) |
| S4 | Type `zzz` | Empty message shows, grid hidden | Pass (message shows). The count still reads "0 thoughtfully selected books". |
| S5 | Type ` clean ` with surrounding spaces | Should still match Clean Code | **Fail**: returns 0 results, because the input isn't trimmed |
| S6 | Clear the search box | All 8 books return | Pass |
| S7 | Search combined with a category | Both filters apply | Pass (by code review) |

### B. Category filtering
| ID | Step | Expected | Result |
|---|---|---|---|
| C1 | Click "Personal Growth" pill | Atomic Habits and Ikigai show | Pass |
| C2 | Pill and header nav highlight in sync | Both mark the active category | Pass |
| C3 | Click "All books" | All 8 return | Pass |
| C4 | Click each category and compare counts | Fiction 2, Business 2, Technology 1, Children 1 | Pass (by data review) |
| C5 | Pick a category from the mobile menu | Menu closes after selection | Pass |

### C. Price sorting
| ID | Step | Expected | Result |
|---|---|---|---|
| P1 | Low to high | 250, 279, 299, 349, 399, 425, 449, 699 | Pass |
| P2 | High to low | Reverse of P1 | Pass |
| P3 | Top rated | 4.9, 4.9, 4.8, 4.8, 4.7, 4.7, 4.6, 4.5 | Pass |
| P4 | Back to Featured | Original order returns | Pass |
| P5 | Sort combined with a filter | Sort applies within the filtered set | Pass (by code review) |

### D. Wishlist
| ID | Step | Expected | Result |
|---|---|---|---|
| W1 | Click hearts on 2 books | Badge shows 2, hearts turn filled | Pass |
| W2 | Click the header ♡ | Only wishlisted books show | Pass |
| W3 | Header button shows an "on" state in wishlist mode | Visible active style | **Fail**: no class or style change |
| W4 | Click a category while in wishlist mode | Ideally stays or clearly exits | **Fail**: it silently leaves wishlist mode |
| W5 | Un-heart every book in wishlist mode | Dedicated "wishlist is empty" message | **Fail**: shows the generic "No books found. Try another search or category." |
| W6 | Refresh the page | Wishlist remembered | **Fail**: lost on refresh (no persistence) |

### E. Shopping cart
| ID | Step | Expected | Result |
|---|---|---|---|
| K1 | Click + on a card | Toast appears, bag count updates | Pass |
| K2 | Add the same book twice | One row with qty 2, not two rows | Pass |
| K3 | Open the bag | Drawer opens | Pass |
| K4 | Remove an item | Row disappears, "bag is empty" message appears | Pass |
| K5 | Escape closes the drawer | Closes | Pass |
| K6 | Click the backdrop | Closes | Pass (by code review) |
| K7 | Keyboard: Tab into the drawer, focus stays inside, focus returns on close | Dialog behavior | **Fail**: focus remains on `<body>` after opening, with no focus trap and no `role="dialog"` |
| K8 | After clicking + or − in the drawer, keyboard focus stays on the same control | Focus preserved | **Fail** (by code review): `innerHTML` is rebuilt, so focus is lost |
| K9 | Refresh | Cart remembered | **Fail**: lost on refresh |

### F. Quantity updates
| ID | Step | Expected | Result |
|---|---|---|---|
| Q1 | Click + | Quantity and header count both rise | Pass |
| Q2 | Click − | Quantity falls | Pass |
| Q3 | Click − at qty 1 | Item is removed | Pass |
| Q4 | Click + many times | Reasonable maximum | **Fail**: 150 clicks on one book gave a subtotal of ₹105,549, so there is no cap |

### G. Subtotal calculation
| ID | Step | Expected | Result |
|---|---|---|---|
| T1 | Midnight Library ×2 (399) + Clean Code (699) | ₹1,497 | Pass |
| T2 | Add one more Midnight Library | ₹1,896 | Pass |
| T3 | Clean Code only (₹699) | "Add ₹100 for free delivery." | Pass |
| T4 | Total ₹1,098 | "You qualify for free delivery." | Pass |
| T5 | Exactly ₹799 | Free-delivery message (the code uses `>=`) | Pass (by code review) |
| T6 | Numbers use thousands separators (₹1,497) | Locale formatting | **Fail** (minor): plain digits such as ₹105549 |
| T7 | Checkout button | Demo toast only | Pass (matches the README) |

### H. Mobile navigation (at 360px)
| ID | Step | Expected | Result |
|---|---|---|---|
| M1 | The ☰ button shows below 700px and the inline nav is hidden | Yes | Pass |
| M2 | Tap ☰ | Nav opens under the header | Pass |
| M3 | Choose a category | Menu closes and the list filters | Pass |
| M4 | ☰ has `aria-expanded` and `aria-controls` | Present | **Fail**: neither attribute exists |
| M5 | Escape closes the menu | Closes | **Fail**: menu stays open |
| M6 | Tapping outside the menu closes it | Closes | **Fail** (by code review): no handler |
| M7 | Header fits the screen | No sideways scroll | **Fail**: see section 4 |

### I. Newsletter form
| ID | Step | Expected | Result |
|---|---|---|---|
| N1 | Submit empty | Browser blocks it (the field has `required`) | Pass |
| N2 | Enter `bad` | Rejected | Pass |
| N3 | Enter `a@b` | Ideally rejected | **Fail** (minor): accepted, since the browser's `type=email` allows a host with no dot |
| N4 | Enter `a@b.com` | Toast "Thanks for subscribing!" and the field clears | Pass |
| N5 | Input shows a focus indicator | Visible | **Fail**: `outline:none`, with no replacement style |
| N6 | Inline error or success text | Message near the field | **Fail** (minor): toast only, no inline error |

### J. Manual items not verified
- Visual quality of the hero book stack, card covers and toast at each width.
- Real touch behavior and the iOS Safari address bar with `position:sticky`.
- Screen-reader announcements (VoiceOver, NVDA).
- Pinch zoom and 200% text-zoom reflow.
- Fonts loading offline. The Google Fonts `@import` will fall back to system sans-serif and serif.

---

## 3. Defects found

| # | Severity | Defect | Evidence |
|---|---|---|---|
| D1 | **High** | The page scrolls sideways on phones narrower than about 382px, which covers the 360px target. The header's minimum content width is 382px. | Measured: `scrollWidth` 382 at 360px and 382 at 320px (+62px). **RESOLVED in Phase 4:** no overflow at 320, 360, 375 or 390px (see section 6). |
| D2 | **High** | The page scrolls sideways at 701–748px, the width range just above the 700px breakpoint. The inline nav needs about 749px but the hamburger switch only happens at 700px. | Measured: `scrollWidth` 749 at a 715px viewport. **RESOLVED in Phase 4:** the hamburger breakpoint moved to 900px, and there is no overflow at 701, 715 or 748px (see section 6). |
| D3 | **High** | The cart drawer isn't an accessible dialog. It has no `role="dialog"` or `aria-modal`. Focus doesn't move in or get trapped. The close "×" and the header wishlist and bag buttons have no accessible names. | `role` and `aria-label` empty, active element is `BODY` |
| D4 | **High** | There are no focus indicators, and the newsletter input has `outline:none`. | `outlineStyle: none` |
| D5 | Medium | The smallest text is 7px, and body text is mostly 9–11px. Muted grays (`#858980`, `#999`) on cream (`#f7f5f0`) are likely below the 4.5:1 WCAG AA contrast ratio. | Measured minimum font 7px at every width. Contrast was estimated, not measured. |
| D6 | Medium | Touch targets are small. About 31–36 interactive elements are under 44×44px, such as the 30px "+" button and the 29px heart. | Counted at 360, 768, 1024 and 1440px |
| D7 | Medium | Search isn't trimmed, so ` clean ` returns nothing (S5). | Tested |
| D8 | Medium | Wishlist mode has several UX gaps: no active state, silent exit, wrong empty message (W3–W5). | Tested |
| D9 | Medium | The cart and wishlist aren't persisted. | By design, and stated in the README |
| D10 | Medium | There's no quantity cap. A single title can reach ₹105,549 in the subtotal. | Tested |
| D11 | Medium | Focus is lost after + or − because `cartRender()` and `render()` rebuild the DOM. This also affects card "+" buttons, since `render()` rewrites the whole grid on every add. | Code review |
| D12 | Medium | The mobile menu lacks `aria-expanded`. Escape and outside-click don't close it. | Tested |
| D13 | Low | `$("#grid").hidden=…` has no effect, because `.grid{display:grid}` overrides `[hidden]`. It works today only because `#empty` is shown alongside. | Measured: `grid.hidden` is true but `display` stays `grid` |
| D14 | Low | The result count still reads "0 thoughtfully selected books" next to the empty message. | Tested |
| D15 | Low | The `.heart` and `.add` buttons set no explicit `font-family`. The hero stack, cover glyphs and other decorative elements aren't `aria-hidden`. | Code review |
| D16 | Low | Titles and authors go into `innerHTML` unescaped. This is safe with the current static data, but it becomes an XSS risk if the data ever comes from an API. | Code review |
| D17 | Low | Fonts load through a render-blocking CSS `@import`, and search re-renders on every keystroke. | Code review |
| D18 | Low | There's no `.gitignore`, and no meta description or favicon. | File listing. **Partially resolved:** `.gitignore` is now created and verified. **Still unresolved:** the meta description and favicon are missing. |

---

## 4. Responsive results

Layout was measured for each viewport, and intermediate widths were swept as well.

| Viewport | Sideways scroll | Header | Product grid | Hero | Notes |
|---|---|---|---|---|---|
| **360px mobile** | **Yes, +22px** (382 vs 360) | Hamburger; the bag button is pushed past the right edge | 2 columns (about 147px cards) | 1 column, h1 55px | The nav is hidden until ☰ opens it. The brand-to-actions gap is only 50px. |
| **768px tablet** | No | Inline nav, 6 buttons, search and actions; fits with about 4px to spare in the test frame | 3 columns (about 218px) | 2 columns, h1 48px | The header is tight. It overflows below about 749px. |
| **1024px laptop** | No | Inline nav, 20px gaps | 4 columns (222px) | 2 columns, h1 61px | Good |
| **1440px desktop** | No | Centered, max-width 1200px | 4 columns (250px) | 2 columns, h1 72px | Good, with the content constrained to the centered container |

### Intermediate width sweep

Viewport widths measured in the layout, with the Chrome scrollbar accounted for.

| Viewport | Sideways scroll | Inline nav | Grid columns |
|---|---|---|---|
| 320px | Yes (+62px) | No (hamburger) | 2 |
| 360px | Yes (+22px) | No (hamburger) | 2 |
| 375px | Yes (+7px) | No (hamburger) | 2 |
| 414px | No | No (hamburger) | 2 |
| 520px | No | No (hamburger) | 2 |
| 700px | Yes (+49px) | Yes | 3 |
| 701px | Yes (+48px) | Yes | 3 |
| 768px | No | Yes | 3 |
| 820px | No | Yes | 3 |
| 900px | No | Yes | 3 |
| 950px | No | Yes | 4 |
| 951px | No | Yes | 4 |
| 1024px | No | Yes | 4 |

**Summary:**
- **320–381px:** overflow, worst at 320px with +62px.
- **382–700px:** no overflow, hamburger layout, 2 columns.
- **701–748px:** overflow of up to about 48px, caused by the inline nav.
- **749px and up:** no overflow.
- Column switching at 950px works. At 951px and up it is 4 columns, and 3 columns below that.

**Other measurements (all four target widths):**
- Smallest rendered font: 7px.
- Interactive elements under 44px: 31 at 360px, 36 at 768, 1024 and 1440px.
- Cart drawer width: 345px at 360px, 420px at 1024px.

**Verdict:** layouts at 768, 1024 and 1440px are structurally sound. 360px is not clean, because of the sideways scroll (D1). The 701–748px gap (D2) is the main hidden problem, and it sits between the tablet and phone targets.

*Update: the verdict above describes the baseline. D1 and D2 were resolved in Phase 4. See section 6.*

---

## 5. Baseline summary

- **Works:** search, category filter, all three sorts, wishlist add and remove, cart add, remove and quantity, subtotal, free-delivery threshold and newsletter happy path.
- **Needs fixing first:** D1 and D2 (sideways scroll), D3 and D4 (accessibility), then D7, D8, D10 and D11.
- **Phase 2 fix list:** D7, D8, D10, D11, D13 and D14.
- **Phase 3 fix list:** D3, D4, D5, D6, D12 and D15.
- **Phase 4 fix list:** D1, D2 and D17. D1 and D2 are **resolved** (see section 6). D17 (render-blocking font `@import`, search not debounced) is **still open**.
- **Phase 5:** D9.
- **Phase 0 housekeeping:** D18 is partially resolved. `.gitignore` is created and verified. The meta description and favicon are still missing (Phase 7).

---

## 6. Phase 4: Responsive UI refinement

Phase 4 fixed the two confirmed responsive defects, D1 and D2. Only `styles.css` was changed. `index.html` and `script.js` were not modified, and `overflow-x:hidden` was not used. Sections 1–5 above record the baseline and are kept as originally written, except for the D1 and D2 status notes and the pointers to this section.

### 6.1 Changes made in `styles.css`

| # | Change | Why |
|---|---|---|
| 1 | **Hamburger breakpoint moved from 700px to 900px.** A new `@media(max-width:900px)` block shows the ☰ button and turns the inline nav into a drop-down. The drop-down is positioned at `top:100%`, so it sits flush under the header at any header height. The 700px block keeps its other mobile rules. | The six-link inline nav needs about 749px, so the old 700px switch left a 701–748px overflow (D2). At 901px the inline nav fits without overflow. |
| 2 | **Two-row header at 480px and below.** A new `@media(max-width:480px)` block lets the header wrap. Row 1 holds the brand, ☰, wishlist and bag. Row 2 holds a full-width search box. Header height becomes `auto` (98px measured). | The brand, ☰, search and actions needed about 382px, so the bag was pushed off-screen on narrow phones (D1). Search is no longer shrunk to 90px at this size. |
| 3 | **`white-space:nowrap` on nav and action buttons.** | Stops the wishlist and bag labels from wrapping. |
| 4 | **Minimum 40×40px size for ☰, wishlist and bag** at 900px and below. | These controls were 28–33px before. |

Header height is now 98px at 480px and below, 65px at 481–700px, and 76px at 701px and above.

### 6.2 Method

- Layout was measured in headless Chrome. Each width was rendered in an iframe of exactly that width, with scrollbars hidden. Results were read as text.
- Measured per width: document `scrollWidth` against `clientWidth`, any element extending beyond the viewport, whether the header controls (☰, search, wishlist, bag) can be hit at their centre point, header height, right-edge positions of the hero heading, hero stack, benefits, pills and cards, and column counts.
- Functional checks run at the 10 target widths: open the menu (or use the inline nav) and filter to Fiction, search `clean`, add a book to the cart and open the drawer, and wishlist a book.
- A before-and-after comparison used a scratch copy of the original CSS, built by reverting the Phase 4 edits.
- An earlier set of screenshots from the first test run was discarded. Headless Chrome has a minimum window width of about 500px, so the 320px image was not really 320px. The iframe approach avoids that limit.
- The scratch test folder was deleted after testing.

### 6.3 Results at the 10 target widths

| Viewport | Overflow before | Overflow after | Header after | Controls reachable after | Functional checks after |
|---|---|---|---|---|---|
| 320px | Yes, +62px (bag unreachable) | **No** (`scrollWidth` 320) | Hamburger, two rows, 98px | Yes | Pass |
| 360px | Yes, +22px (bag unreachable) | **No** (360) | Hamburger, two rows, 98px | Yes | Pass |
| 375px | Yes, +7px | **No** (375) | Hamburger, two rows, 98px | Yes | Pass |
| 390px | No | **No** (390) | Hamburger, two rows, 98px | Yes | Pass |
| 701px | Yes, +48px (bag unreachable) | **No** (701) | Hamburger, one row, 76px | Yes | Pass |
| 715px | Yes, +34px (bag unreachable) | **No** (715) | Hamburger, one row, 76px | Yes | Pass |
| 748px | Yes, +1px | **No** (748) | Hamburger, one row, 76px | Yes | Pass |
| 768px | No | **No** (768) | Hamburger, one row, 76px | Yes | Pass |
| 1024px | No | **No** (1024) | Inline nav, one row, 76px | Yes | Pass |
| 1440px | No | **No** (1440) | Inline nav, one row, 76px | Yes | Pass |

For all 10 widths after the fix:
- No element extends past the viewport.
- The hero heading, hero stack, benefits strip, category pills and book cards all end inside the viewport.
- Search `clean` returns 1 book, filtering to Fiction returns 2 books, the cart drawer fits the viewport, and the wishlist count updates.
- The menu closes after a category is chosen (hamburger widths).
- Control sizes: ☰, wishlist and bag are 40×40px (bag 52×40px) at hamburger widths. At 901px and above, the wishlist and bag buttons are unchanged (about 39×19px and 52×19px).
- Product grid: 2 columns at 320–700px, 3 columns at 701–950px, 4 columns above 950px. Hero: 1 column at 700px and below, 2 columns above.
- Smallest card width: 134px at 320px and 250px at 1440px.

### 6.4 Breakpoint boundary checks (measurement only)

| Viewport | Overflow | Header |
|---|---|---|
| 480px | No | Two rows (98px) |
| 481px | No | One row (65px) |
| 700px | No | One row (65px), hamburger |
| 900px | No | Hamburger, one row (76px) |
| 901px | No | Inline nav, one row (76px) |

The boundaries behave as designed. The 900/901px switch between hamburger and inline nav, and the 480/481px switch between the two-row and one-row header, were both confirmed.

### 6.5 Inspection coverage

| Width | Visual inspection | Measurement only |
|---|---|---|
| 320px | **Yes** (page top; menu-open state) | |
| 360px | **Yes** (page top) | |
| 375px | | **Yes** |
| 390px | | **Yes** |
| 701px | | **Yes** |
| 715px | **Yes** (page top; menu-open state) | |
| 748px | **Yes** (page top) | |
| 768px | | **Yes** |
| 1024px | **Yes** (page top) | |
| 1440px | | **Yes** |
| 480, 481, 700, 900 and 901px | | **Yes** (boundary checks) |

- Visual inspection means I viewed screenshots of the top of the page (header, hero, start of the catalog). I did not view the full page length at any width.
- At 320px and 715px I also viewed the menu in its open state.
- At 748px the screenshot was taken in a direct 748px window. 748px is above Chrome's minimum window width, so that image is valid.
- A correction: a status summary given after the Phase 4 work listed 748px as not viewed. That was wrong. The 748px screenshot was viewed, so it is recorded as visually inspected here.

### 6.6 Observations from visual inspection

- **320px and 360px:** the header wraps into two rows, with the search box on its own row below the brand and controls. The wishlist and bag counts are visible. The hero heading wraps over several lines, and the hero stack and benefits strip sit inside the viewport.
- **715px and 748px:** the header is a single row with the brand, ☰, search, wishlist and bag. The category menu opens as a row flush under the header (verified at 715px).
- **1024px:** the inline nav layout is visually the same as before the change.

### 6.7 Status of pending and remaining items

**Still pending (not tested):**
- Real-device testing (iOS Safari, Android Chrome, real touch input, the mobile browser address bar with the sticky header).
- Cross-browser testing (Firefox, Safari and Edge). All Phase 4 results come from headless Chrome only.
- Screen-reader and keyboard walkthrough of the new header layout and menu.
- Pinch zoom and 200% text-zoom reflow.
- Full-page visual review at every width (only the top of the page was inspected).

**Remaining responsive observations (not fixed in Phase 4):**
- At 320px the hero heading wraps to four lines at 55px.
- The ☰ button sits slightly off-centre at the 715–900px layout, because of the existing `space-between` spacing.
- The header is taller (98px) at 480px and below, so the sticky header takes more vertical space on small phones.

**Related defects still open:**
- D17: render-blocking `@import` for fonts, and search re-renders on every keystroke (Phase 4 fix list, not yet done).
- D3–D6, D12 and D15: accessibility, font-size and touch-target work for Phase 3. Hamburger-menu `aria-expanded` and Escape/outside-click handling (D12) are unchanged.
- D18: meta description and favicon are still missing.

**Baseline results left as they were:** checklist items M1 and M7 in section 2H still show their baseline results. M1 says the ☰ button shows below 700px, which is now 900px (see 6.1). M7 says the header does not fit, which was true at baseline and is resolved (see 6.3).

---

## 7. Phase 1: Head metadata and repository hygiene

Phase 1 changed `index.html` (head only). The `_verify/` rule in `.gitignore` was added by the project owner, not by the assistant, because the assistant's write to `.gitignore` was blocked by an access restriction. `styles.css`, `script.js` and `README.md` were not modified.

### 7.1 Results

| ID | Check | Baseline | After Phase 1 | How it was verified |
|---|---|---|---|---|
| H1 | Meta description present | Fail | **Pass** | Executed by `_verify/phase1_harness.html` in headless Microsoft Edge (reads the `content` attribute). Also confirmed in the file source. |
| H2 | Favicon is an inline SVG data URI | Fail | **Pass** | Executed by the harness in headless Edge (`href` starts with `data:image/svg+xml`). Also confirmed in the file source. Whether the icon looks right in a browser tab was **not** checked. |
| H3 | `document.title` reads `Chapter & Co. \| Bookstore` | Pass | **Pass** | Executed by the harness. |
| H4 | Title is escaped as `&amp;` in the raw HTML | Not run | **Separately verified, not harness-tested** | The browser decodes entities, so the harness cannot see the raw source. Checked by reading the file: `<title>Chapter &amp; Co. \| Bookstore</title>`. |
| G1 | `_verify/` listed in `.gitignore` | Not present | **Pass (file read)** | Read `.gitignore`: line 15 is `_verify/` and all earlier entries are intact. Not tested with Git, because the project is not yet a Git repository. |

### 7.2 Harness totals

`_verify/phase1_harness.html`, headless Edge, 360px iframe, opened over `file://`:

| Run | Executed | Pass | Fail | Not run | Info only |
|---|---|---|---|---|---|
| Baseline (before the `index.html` edit) | 61 | 51 | 10 | 4 | 3 |
| After Phase 1 | 61 | 53 | 8 | 4 | 3 |

The only changes between the two runs are H1 and H2 (Fail to Pass).

### 7.3 Remaining failures after Phase 1

| ID | Issue | Planned phase |
|---|---|---|
| K7 | The drawer has no `role="dialog"`, and focus stays on the Bag button | Phase 2 |
| K7b | The close button has no accessible name | Phase 2 |
| M4 | The ☰ button has no `aria-expanded` or `aria-controls` | Phase 2 |
| M5 | Escape does not close the mobile menu | Phase 2 |
| N5 | The newsletter input has no visible focus indicator | Phase 2 |
| K8 | Focus drops to `BODY` after `+` in the drawer | Phase 3 |
| N3 | `a@b` is accepted as an email | Phase 3 |
| N6 | No inline newsletter error or success message | Phase 3 |

### 7.4 Not run or not verified

- **W6 and K9** (persistence after refresh): no `localStorage` exists yet. Phase 4.
- **T5** (exactly ₹799): code review only (`total>=799`).
- Not tested: other browsers, widths other than 360px, real devices, screen readers, text zoom.
- Measured only, not pass or fail: 31 interactive elements under 44×44px at 360px (D6), smallest font 7px (D5), render-blocking font `@import` (D17).

### 7.5 Defect status update

- **D18:** the meta description, favicon and escaped title are **resolved**. The `.gitignore` is also resolved for `_verify/`.
- All other defects are unchanged from sections 3 to 6.

### 7.6 Files and method

- Changed in Phase 1: `index.html` (line 2, head only) and `.gitignore` (by the project owner).
- Phase 1 harness and outputs, kept in `_verify/` and awaiting your approval before removal: `phase1_harness.html`, `edge_out.txt`, `edge_err.txt`.
- Total files in `_verify/`: 31 (the original 28 plus the three above).
- Unchanged, confirmed by SHA-256 comparison with the pre-edit baseline: `styles.css`, `script.js`, `README.md`.

## 8. Phase 2: Accessibility

Run on 2026-11-17 in headless Edge with `_verify/phase2_harness.html` (synthetic events and computed styles). Not a real keyboard, device or screen-reader test.

### 8.1 Results

- **Phase 2 harness:** 61 executed, 61 pass, 0 fail.
- **Phase 1 harness (regression):** 61 executed, 59 pass, 2 fail, 4 not run, 3 info.
  - K7, K7b, K8, M4, M5 and N5 now pass.
  - The two fails are the Phase 3 items N3 (`a@b` accepted) and N6 (no inline newsletter message).
  - D6 now reports 8 interactive elements under 44px at 360px (was 31). D5 still reports 7px, which is the decorative `.cover` text.

### 8.2 What was verified

| Area | Checks |
|---|---|
| Cart drawer | `role=dialog`, `aria-modal`, `aria-labelledby` resolves to "Your book bag", close button name, focus moves in, focus returns to Bag after ×, Escape and backdrop click, Tab and Shift+Tab wrap, focus recovered from outside or `BODY` |
| Cart focus (K8) | Focus stays on the same control after `+` and `−`, and stays inside the drawer after a removal, a Remove click and reaching the maximum quantity |
| Grid focus | Focus stays on the Add and heart buttons after re-render |
| Mobile menu | `aria-expanded` and `aria-controls`, Escape, outside click, focus restore, Escape order (drawer first) |
| Focus visibility | 2px `:focus-visible` outline on 11 key controls, including the newsletter input; ring contrast 8.85:1; no `outline:0/none` rules left |
| Decorative content | Glyphs, brand mark, hero stack and card covers are `aria-hidden` |
| Contrast | 149 text elements outside `.cover` and `.stack` pass 4.5:1 (3:1 for large text); placeholder text 4.5:1 or more; control borders 3.29:1 |
| Font size | Minimum 12px outside the decorative `.cover` |
| Layout | Widths 320, 360, 375, 390, 480, 481, 700, 701, 715, 748, 768, 900, 901, 950, 1000, 1024, 1025, 1100, 1440: no horizontal overflow, header inside viewport, opened menu fits, cards and drawer fit |
| Target size | 44px at 900px and below, 24px above, at every width listed |

### 8.3 Defects found and fixed during testing

- Placeholder text was 4.23:1; set to `#636960`.
- The "Demo only" note in the drawer was 10.8px; set to 12px.
- The brand link was 27px tall at 900px and below; given 44px of vertical hit area.
- The 320px layout overflowed by 1px because of a hero book; `.hero` now clips horizontally.
- The inline nav overflowed at 1001px at 12px text; the hamburger breakpoint moved to 1024px.
- Focus dropped to `BODY` after Add and heart clicks in the grid; `render()` now restores it.

### 8.4 Changed behaviour to review

- The hamburger breakpoint is now 1024px (was 900px). The 3-column grid breakpoint is unchanged at 950px.
- Cover text on the Ikigai and Think gradients is unchanged by decision (Phase 6).

### 8.5 Not run (pending)

- Real keyboard Tab order, real touch devices, pinch zoom and 200% zoom.
- Screen readers (NVDA, VoiceOver, TalkBack).
- Browsers other than Edge.
- Visual inspection of the new focus rings and spacing, and of the favicon.
- The harness checks target size by box size only, not spacing between targets.

### 8.6 Files

- Changed: `index.html`, `script.js`, `styles.css`, this file.
- Added: `_verify/phase2_harness.html`.
- Unchanged: `README.md`, `.gitignore`.
## 9. Phase 3: JavaScript robustness

Run on 2026-11-17 in headless Edge with `_verify/phase3_harness.html` (synthetic events, computed styles, stubbed `matchMedia`). Not a real keyboard, device or screen-reader test.

### 9.1 Results

- **Phase 3 harness:** 96 executed, 96 pass, 0 fail, 1 info (F4).
- **Phase 2 harness (regression):** 61 executed, 61 pass, 0 fail.
- **Phase 1 harness (regression):** 61 executed, 51 pass, 10 fail, 4 not run, 3 info. All 10 fails are explained below. N6 now passes.
- **`node --check script.js`:** passed.

### 9.2 Phase 1 harness: 10 expected differences (not regressions)

| IDs | Why they now differ |
|---|---|
| S1, S2, S3, S4, S5, S7, D13, D14 | The Phase 1 harness reads the grid synchronously after typing. Search results now appear 150ms later by design. The same searches pass in the Phase 3 harness (B14 to B21, after waiting). |
| N4 | It expects a "Thanks" toast. Approved Decision 4.5 replaced the toast with an inline demo message (Phase 3 C5, C6, C7). |
| N3 | It calls the browser's `checkValidity()` after setting the value, without firing an event. Native `type=email` accepts `a@b`. The app's validation runs on submit and on input, and rejects `a@b` (Phase 3 C2). **N3 is a limitation of the Phase 1 test method, not a fix of the app's native validity.** |

The old harness was not changed. The Phase 1 and Phase 2 harness files are unmodified.

### 9.3 What was verified (Phase 3 harness)

| Area | Checks |
|---|---|
| HTML injection | Hostile title, author, tag, category, colour, art, rating and id values render as text only. No injected elements or attributes, no script ran, `aria-label` values intact, cover text not double-escaped (A1 to A9) |
| Search text | `<img onerror>` typed into search stays text in the count and the empty message (A10) |
| Clean Code cover | The `</>` glyph is now in the DOM and has a rendered box (A11, A11b). Before the fix, the live DOM showed an empty `<span>`. |
| `&` handling | Ikigai author and the "CHAPTER & CO. EDITION" label show a single `&` (A12, A13) |
| Debounce | State stored at 0ms. Grid unchanged at 0 and 100ms, updated by 200ms. Six rapid keys cause one render. Clearing, whitespace-only and "Clear search" render immediately. A pending timer is cancelled by clearing and by category or sort changes (B1 to B13) |
| Search behaviour | Title, author (case-insensitive), category, trimmed text, category plus search, wishlist plus search, empty-state wording (B14 to B21) |
| Newsletter | 23 invalid addresses (including `a@b`), over-long local part, label and address, empty and whitespace-only are rejected with an inline message, `aria-invalid`, focus on the field and `checkValidity()` false. 8 valid addresses (including `a@b.co`, `first.last+tag@sub.example.com`, `o'brien@example.org`) are accepted with the approved demo message and a cleared field (C2 to C5b) |
| Newsletter behaviour | Live region present and empty before use. `aria-describedby` resolves. Success message exact. No toast. Live update while typing after a failed submit. Error clears when the value becomes valid. No error before the first submit. `submit` is cancelled. `requestSubmit()` keeps the same page (C0 to C14) |
| Newsletter contrast | Error and success message colours at least 4.5:1 (C15, C16) |
| Split rendering | Add, heart and cart `+` do not rebuild the grid. Same card and button nodes, focus stays, badges update. Hearts update in place. Search, sort and category each cause one grid render (D1 to D5, D25) |
| Drawer announcements | Polite and atomic status inside the dialog, visually hidden, empty on open. Announces `+`, `−`, Remove, removal at quantity 1 and the maximum (D6 to D12) |
| Focus | After Remove: the row that took its place, else the previous row, else the close button. After `−` that removes a row: the next row's `−`. Empty-state button focuses the search box or the "All books" pill. "Show all books" in the wishlist bar focuses the Wishlist button. Un-hearting in the wishlist view keeps focus in the grid (D13 to D24) |
| Defensive guards | `−` and `+` on a stale cart row do not throw (D17, D18) |
| Toast | Toast z-index above the open drawer, and inside the viewport (E1, E2) |
| Reduced motion | `scrollIntoView` uses `auto` when `prefers-reduced-motion: reduce` is stubbed on, `smooth` otherwise. The stylesheet rule exists (F1 to F3) |
| Layout | Newsletter with error and success messages shown at 320, 360, 700, 701, 1024 and 1440px: no overflow, inside the viewport, 44px targets at 900px and below, 430px cap and 25px top margin kept (G1 to G5) |
| Errors | No uncaught script errors during the run (Z1) |

A screenshot at 360px and 1024px showed the error state under the newsletter field, with a red underline and focus ring. I looked at it once and deleted it.

### 9.4 Defects found and fixed during Phase 3

- `art:"</>"` rendered as an empty cover glyph because the raw `</>` was dropped by the HTML parser. Escaping fixes it.
- Toast (`z-index:10`) sat behind the drawer backdrop (`z-index:20`). It is now `z-index:30`.
- Newsletter success was claimed as "subscribed" although nothing is stored. It now says it is a demo.
- Harness-only fixes: `esc` is not on `window`, one assertion used a result that did not need a pending timer, and the toast text carried over between checks.

### 9.5 Changed behaviour to review

- Search results lag typing by up to 150ms. The search text itself is stored immediately.
- The newsletter form is now `novalidate`. Browser validation bubbles no longer appear. The inline message replaces them.
- The form is wrapped in `div.newsletter-form`, which now carries the 430px cap and the mobile top margin.
- Heart clicks update the button in place. The grid is rebuilt only in the wishlist view.
- The newsletter success toast no longer appears.

### 9.6 Known limitations

- **Email validation is practical, ASCII-only.** Internationalized addresses are **not supported**: Unicode local parts, IDN domains, punycode TLDs, quoted local parts and IP-literal domains are rejected.
- **Repeated identical errors are not re-announced.** Submitting the same invalid value twice does not rewrite the live region, so a screen reader may not repeat it. Focus returns to the field, where the message is read through `aria-describedby`.
- **Cart rows are still rebuilt** on each change. Up to 8 rows. Focus restore is tested.
- **Phase 4 note:** the cart copies full book objects. Store only `{id, qty}` in `localStorage` and rebuild titles and authors from `books`.

### 9.7 Not run (pending)

- Real typing, IME input and autofill in the email field.
- Screen readers (NVDA, VoiceOver, TalkBack): live regions, the drawer announcement, the newsletter message.
- Real operating-system "reduce motion" setting (only `matchMedia` was stubbed).
- Real devices, other browsers, pinch zoom and 200% zoom.
- A visual check of the Clean Code cover glyph. Only its DOM text and box size were checked.

### 9.8 Files

- Changed: `script.js`, `index.html` (newsletter markup and drawer status), `styles.css` (newsletter wrapper, message styles, `.sr-only`, toast z-index), this file.
- Added: `_verify/phase3_harness.html`.
- Unchanged: `README.md`, `.gitignore`, and all earlier `_verify/` files.
## 10. Phase 4: Cart and wishlist persistence

Run on 2026-11-17 in headless Edge with `_verify/phase4_harness.html`. Cart and wishlist are stored in `localStorage`. All Phase 4 harness runs used a throwaway browser profile (`_verify/p4_profile`), which was deleted afterwards. Not a real-browser, real-device or multi-window test.

### 10.1 Results

- **Phase 4 harness, full suite:** 97 executed, 97 pass, 0 fail.
- **Browser-launch persistence:** 3 executed, 3 pass (L1, L2, L3). Two separate Edge processes shared one explicit `--user-data-dir`.
- **Phase 3 harness (regression):** 96 executed, 96 pass.
- **Phase 2 harness (regression):** 61 executed, 61 pass.
- **Phase 1 harness (regression):** 61 executed, 51 pass, 10 fail. The same 10 as after Phase 3 (S1, S2, S3, S4, S5, S7, D13, D14, N3, N4), all explained in section 9.2. Nothing new fails.
- **`node --check script.js`:** passed.

### 10.2 Storage format

- **Key:** `chapterco:bookstore:v1`. **Value:** `{"v":1,"cart":[{"id":1,"qty":2}],"wishlist":[3,7]}`.
- Not stored: titles, authors, prices, metadata, search text, sort, category, wishlist-only view.
- At load the in-memory cart is rebuilt as `{...book, qty}` from the catalog, so rendering and handlers are unchanged.

### 10.3 What was verified

| Area | Checks |
|---|---|
| Sanitizer (A1 to A12) | Valid payloads kept. 13 malformed or wrong-root values return "unusable". Missing, wrong or unsupported version is rejected. Bad structure inside a valid root is dropped. 11 invalid ID forms and 11 invalid quantity forms are dropped. Quantities of 11, 25, 1e9 and 1e21 are clamped to 10. Duplicate cart IDs keep the first and wishlist duplicates are removed in order. Extra and hostile fields (`title`, `price`, `__proto__`) are ignored, with no prototype pollution. Values over 10,000 characters and non-string input are rejected. |
| Loading (B1 to B8) | Badges, labels, filled hearts, drawer rows and subtotal restored. A stored hostile title or author is ignored and the catalog value shown. Quantity 10 disables `+` and shows the maximum note. Quantity 25 shows as 10. Unknown IDs are ignored. Loading performs no write. Empty storage creates no key. |
| Saving (C1 to C17) | Exact stored string checked after each of 10 mutations: grid Add (new and repeat), heart on and off, cart `+`, `−`, `−` at quantity 1, Remove, and un-hearting inside the wishlist-only view. Exactly one write per mutation, always to the one key. Search, sort, category, wishlist view, drawer, checkout demo, newsletter and menu write nothing. Add at the limit and a stale `−` click write nothing. Payload contains no titles, authors, prices or metadata. |
| Reload (D1 to D5) | State restored after page re-load and after real reloads of the plain `file://` page. Search, sort, category and wishlist view are not restored. Dirty saved data is normalised on load and rewritten clean on the next change. |
| Malformed or hostile data (E1, E2) | 12 bad stored values: the app starts normally, the saved value is left untouched at load and is overwritten by the next change. `__proto__` in stored JSON does not pollute the page. |
| Storage failures (F) | Five stubbed conditions: `localStorage` getter throws `SecurityError`, `localStorage` is `undefined`, `localStorage` is `null`, `setItem` throws `QuotaExceededError`, `getItem` throws. In each, the page starts without errors, cart, hearts, search, sort, category, wishlist view, drawer focus handling and the checkout demo keep working in memory. The one-time notice appears on the first failed save, never at page load, and only once across many failures. After a successful save it can appear again. `storage` and `pageshow` re-sync do not throw. When writes fail, nothing reaches the real storage. |
| Cross-tab sync (G1 to G17) | Two same-origin frames stand in for two tabs. Changes in A reach B (badge, label, hearts). The event fires only in the other tab, and B writes nothing in response, so there is no ping-pong. With B's drawer open, rows update and "Your bag was updated in another tab." is announced. If A removes the row B has focused, focus falls back to a row inside the drawer, not `BODY`. Nothing is announced if B's drawer is closed. B in wishlist-only view updates its grid. Unrelated keys, same-content events, malformed data and an unsupported version are ignored. Valid data from another writer is adopted. `clear()` empties both tabs. `pageshow` re-syncs only when `persisted` is true. |
| Hygiene (Z1, Z2) | No storage key left behind. No uncaught script error in any page during the run. |

### 10.4 Persistence across browser launches (file://)

- **With an explicit `--user-data-dir`:** state written in launch 1 was restored in launch 2, a separate Edge process (L2, L3). The saved key was `file://` scoped.
- **Without it (default headless profile):** state did **not** survive. A control run with two default-profile launches saved in launch 1 and found nothing in launch 2. Headless Edge appears to use a throwaway profile unless told otherwise. That is a property of the test environment, not evidence about normal browser use.
- **A normal desktop browser was not tested.** Persistence across a real browser restart is therefore pending (see 10.7).

### 10.5 Test-method notes (honest account)

- Two harness assertions failed on the first full run and were corrected, not the app:
  - **D5:** it checked the badge after an extra Add. It now checks the badge at load, then the rewrite after the next change.
  - **G6:** the test removed the row through a real click in frame A, which moved focus into frame A and took focus away from the row in frame B, so the test condition was not reached. A separate probe showed this. The test now removes the row from A's state and saves, as the app does, and checks B's focus fallback.
- The failure-mode tests (F) replace the browser's storage API inside the page before the app's script runs. They prove the app's `try/catch` paths. They do not prove how a real browser behaves when cookies are blocked.
- Two same-origin frames in one page stand in for two tabs. This exercises the `storage` event but not real separate windows or processes.
- Phase 1 to 3 harnesses and `phase4_harness.html` all ran with a fresh profile per run, so no state leaked between runs.

### 10.6 Known limitations

- **Last writer wins.** Each write replaces the whole saved state. If two tabs change the cart or wishlist at the same moment, the last write overwrites the other and both tabs then show the same state. This is tested and documented (G17). No merging is attempted.
- **Origin sharing on `file://`.** Chromium treats all local files as one `file://` origin, so other local pages could read, overwrite or clear the key. That is why all stored data is validated. Other browsers may isolate or block `localStorage` per file. This is not tested.
- **Silent clean-up.** Unknown IDs, bad entries and quantities above 10 are dropped or clamped without telling the user. A book later removed from the catalog disappears from a saved cart silently. Prices always come from the current catalog.
- **No expiry.** Saved data stays until the user clears site data.
- **Failed save notice.** The notice appears only on the first failed save in a run of failures. It is a toast, shown for 5 seconds.
- **Checkout** is still a demo and does not clear the saved cart.
- **A previous-page value** is never trusted: the first user change after load overwrites unreadable or unsupported saved data, as approved.

### 10.7 Not run (pending)

- Persistence across a real browser restart in a normal profile, in Edge, Chrome, Firefox and Safari.
- Real two-window or two-tab synchronisation, including focus behaviour with real window focus.
- Real private or incognito mode, blocked-cookie settings and enterprise policy.
- Clearing site data through DevTools or browser settings, then reloading.
- Real storage-quota exhaustion.
- Back/forward-cache restore (`pageshow` with `persisted: true`) in a real browser. Only a synthetic event was dispatched.
- Screen-reader announcement of "Your bag was updated in another tab."
- Real devices and mobile browsers.

### 10.8 Files

- **Changed:** `script.js` (persistence block, four save calls, load, `storage` and `pageshow` listeners; `toast()` takes an optional duration), this file.
- **Added:** `_verify/phase4_harness.html`.
- **Unchanged (hash compared):** `index.html` (`2828C809`), `styles.css` (`253217C0`), `README.md` (`5C352335`), `.gitignore` (`71396B05`), and the Phase 1, 2 and 3 harness files.
- **Temporary files and folders created for Phase 4** (`_verify/p4_profile`, `_verify/p4_probe.html`, `_verify/p4_probe2.html`) were deleted. `_verify/` holds the original 31 items plus `phase4_harness.html`.

## 11. Phase 5: Code organisation and maintainability

Run in headless Edge with `_verify/phase5_harness.html`, which loads the frozen original (`_verify/phase5_baseline/`) and the refactored app side by side and compares them. No functional change was intended. Not a real-browser, real-device or screen-reader test.

### 11.1 Results (final state of all three files)

- **Phase 5 differential harness:** 59 executed, 59 pass, 0 fail.
  - `#static` 14/14, `#layout` 17/17, `#focus` 4/4, `#touch` 7/7, `#seeds` 9/9, `#behave` 3/3, `#fail` 5/5.
- **Phase 4 harness:** 97 executed, 97 pass. **Launch tests** (explicit `--user-data-dir`): L1 1/1, L2 2/2, L3 97/97.
- **Phase 3 harness:** 96 executed, 96 pass.
- **Phase 2 harness:** 61 executed, 61 pass.
- **Phase 1 harness:** 61 executed, 51 pass, 10 fail. The same 10 IDs as before the refactor (S1, S2, S3, S4, S5, S7, D13, D14, N3, N4), all explained in section 9.2. Nothing new fails.
- **`node --check script.js`:** passed.
- The full suite was run after each of the three files was refactored (`script.js`, then `styles.css`, then `index.html`), and again at the end.

### 11.2 What the Phase 5 harness compares

| Group | Checks |
|---|---|
| `#static` (G, H, C) | 50 top-level names (functions, `const`, `let`) exist in both pages with the same kind and arity or value. No window-level function was removed. `cardHTML()` output is identical for all 8 books (saved and unsaved) and a hostile book object. `countText()`, `emptyState()` and `money()` are identical for 5 combinations. The normalised DOM (756 tokens: tags, all attributes, ids, classes, text, rendered inline whitespace) is identical. Script, stylesheet and favicon references are unchanged. The CSS is flattened to media, selector, property and resolved value: 1,436 declarations in both, the same multiset, and the ordered values for every repeated media, selector and property are unchanged. The `@import` is identical. |
| `#layout` (C320 to C1440) | Computed style of every element, plus `::before`, `::after` and `::placeholder`, and the bounding box and scroll size, at all 17 widths: 320, 360, 375, 390, 480, 481, 700, 701, 768, 900, 901, 950, 1000, 1024, 1025, 1100, 1440. States at every width: initial, menu open, drawer open with a maxed-out item, wishlist view, empty state. At 320, 480, 701, 901 and 1025 also: empty drawer, empty wishlist, search hit, category and sort, newsletter error, newsletter success, toast, toast over the drawer. |
| `#focus` (F) | Every visible focusable element on the page, in the open drawer and in the open menu, focused at 375, 1000 and 1440px. Style, `:focus-visible` match and focus result compared. 151 elements visited, 148 matched `:focus-visible`, 3 were the disabled `+` at the limit (cannot take focus). |
| `#touch` (T) | Both stylesheets reloaded with `(pointer: coarse)` and `(prefers-reduced-motion: reduce)` rewritten to always match (2 replacements in each). Seven states compared at 320, 481, 768, 1000 and 1440px, 1,750 comparisons per width. |
| `#seeds` (S) | Start-up with eight kinds of stored data (none, valid, clamped, malformed, `null`, wrong version, oversized, hostile `__proto__`). Identical rendered page, state and stored value. `parseSaved()` is identical for 10 raw inputs. |
| `#behave` (B) | Seeded random differential runs of 400 actions at 1000px, 250 at 1440px and 250 at 320px (900 in total, 27 action kinds, including synthetic Tab and Escape key events, `storage` and `pageshow` events). After every step the page HTML, field values, validity, focus, state, stored value, write count, page errors, and the warning flags were compared. |
| `#fail` (X) | Two runs of 100 steps each with `localStorage` flipping at random between working, `QuotaExceededError`, a throwing getter (`SecurityError`) and `null`. Plus three fixed modes from first load: identical state, one-time warning flag, toast text and no page errors. |

### 11.3 Harness self-checks (so a pass means something)

- **Identical inputs:** with the baseline loaded on both sides, every group first showed zero differences.
- **Deliberate mutants** (copies in a scratch folder, since deleted), each caught by the harness:
  - one word changed in the HTML: `#static` H1 failed;
  - one digit changed in a CSS grey (`#5f655b` to `#5f655c`): `#static` C1 and C3 failed, and all 17 `#layout` widths failed;
  - `saveState()` removed from the Remove path in `script.js`: `#behave` B1 and B3 failed. **B2 did not fail** because its 250 actions did not reach that path, so one seed alone does not guarantee detection.

### 11.4 Harness defects found and fixed during testing (the app was not changed for any of these)

- The first run showed focus-related differences even between identical pages. Only one iframe can hold focus at a time, so the second page never received real focus. Each page is now set up, focused and measured in turn.
- The global-name check picked up a local `let msg`, and `money` is a lexical `const` that must be read through `eval`.
- The CSS `@import` regex stopped at the first `;` inside the URL, so the stylesheet used in the touch test was cut off. It now matches the whole statement.
- The cascade-order check (C5) first reported 868 reordered rule pairs. Most of them cannot match the same element. It now tests each pair against a fully populated page. The result is 868 reordered pairs in total, 0 that share an element. This is a heuristic, backed by the computed-style comparison above.
- Computed-style comparison ignores custom properties, because the new `:root` legitimately has more of them.
- The test runner crashed twice on a locked output file left by a previous Edge process. It now uses a throwaway profile and output file per run and stops only its own processes. During that time some summaries came from incomplete runs. The final numbers above come from complete runs with the fixed runner.

### 11.5 Changes made

| File | Before | After | Change |
|---|---|---|---|
| `script.js` | 262 lines | 430 lines | 11 sections with a file map and a list of test-facing names. Magic values moved to constants (`FREE_DELIVERY_MIN`, `ALL_BOOKS`, `CATEGORIES`, `TOAST_MS`, `STORAGE_TOAST_MS`, message strings). Added `$$`. Cart `+`/`−`/Remove logic moved from the click handler into `changeCartQty()` and `removeFromCart()`. Anonymous listeners became named `on...` functions. Extracted `gridFocusKey()`, `visibleBooks()`, `cartRowHTML()`, `cartSummaryHTML()`, `loadSavedState()`, `buildPills()`, `bindUiEvents()`, `bindStorageEvents()`, `init()`. Large template literals were split by concatenating the same pieces, with no newline inside any template. Operation order is unchanged: pills, listeners, saved state, storage listeners, `render()`. 27 window-level functions were added (information item G3). None was removed or renamed. |
| `styles.css` | 41 lines | 1,022 lines | One declaration per line. 9 documented sections plus a breakpoint table. 117 top-level rules moved whole. New tokens for exactly repeated values: `--field-border` (4 uses), `--error` (3), `--surface-alt` (2), `--font-display` (7), `--font-sans` (3), `--z-header`, `--z-drawer`, `--z-toast`, `--target-min` (3), `--target-touch` (3). The near-duplicate greys (`#5f655b`, `#60675f`, `#636960`, `#6b6f67`) were not touched. The two `max-width: 480px` blocks were merged into one, because the equivalence tests showed identical results. |
| `index.html` | 13 lines | 122 lines | Head split over lines, block and flex-child elements on their own indented lines. Inline runs that contain visible whitespace stay on one line (`chapter<span>&</span>co.`, the wishlist and bag buttons, the footer). The favicon data URI is byte-identical on one line. |

### 11.6 Remaining differences

- **None in behaviour, DOM, CSS declarations or computed layout** across everything the harness checks.
- Source differences only: formatting, comments, token names, the merged 480px block, and the new helper functions listed above.
- Four literal `#636960` values remain in `styles.css` although `--muted` has the same value. They were left as they were, to avoid touching grey shades.

### 11.7 Not run (pending)

- Hover and active states at computed-style level (compared only at rule level, through the declaration comparison).
- Pixel or screenshot comparison.
- Real touch devices and real coarse-pointer hardware (simulated by rewriting the media query).
- Other browsers (Chrome, Firefox, Safari) and real browser restart persistence (still pending from section 10.7).
- Screen readers and real keyboard Tab order (key events were synthetic).
- Long-run randomised behaviour beyond the seeds listed above.

### 11.8 Files

- **Changed:** `index.html` (`E00A97AE`), `script.js` (`A4B22457`), `styles.css` (`0DCAC489`), this file.
- **Added:** `_verify/phase5_harness.html`, `_verify/phase5_baseline/` (frozen originals, `2828C809`, `800F702F`, `253217C0`; kept until you approve its removal), and three scratch tools: `_verify/p5_run.ps1` (test runner), `_verify/p5_css_parse.js` and `_verify/p5_css_gen.js` (they produced the reorganised stylesheet from the baseline).
- **Unchanged (hash compared):** `README.md` (`0225CACF`), `.gitignore` (`71396B05`), and the Phase 1 to 4 harness files (`F4E70BEF`, `302DE8AA`, `DA50EC2E`, `F95EA763`).
- **Temporary files** (mutant copies, scratch probes, output dumps, throwaway browser profiles) were deleted. No existing `_verify/` file was deleted or overwritten.

## 12. Final closeout (Phase 6 partial, development closed)

**Status: development is closed by the project owner. Phase 6 was stopped after steps 6.0 to 6.2 and the F1/F2 fix verification. Steps 6.3 to 6.9 were not performed. This is not a full QA completion, and nothing in this section should be read as one.**

Everything below was run by driving headless Edge and headless Chrome (both Chromium) through the DevTools protocol, plus the existing harnesses in headless Edge. DevTools mouse input is synthetic, not a physical mouse. Nothing here is a real-device, real-keyboard, screen-reader or non-Chromium test. Older sections are not rewritten. Where a statement in sections 6 to 11 is now out of date, section 12.7 says so.

### 12.1 What was run in Phase 6

| Step | What | Result |
|---|---|---|
| 6.0 Preflight | Full SHA-256 of all files. All Phase 1 to 5 harnesses re-run in headless Edge, before any change. Phase 2 and Phase 5 `#static` re-run once in Chrome. | Counts matched the Phase 5 end state (section 11.1). Chrome: Phase 2 61/61, `#static` 14/14. These runs were **before** the F1/F2 edit. |
| 6.1 Driver | A DevTools driver (`_verify/phase6/cdp.js`) with a temporary profile per run. The debug port was bound to 127.0.0.1 only (checked with `netstat`). | Smoke test passed in Edge and Chrome: page load over `file://`, a DevTools click on Bag opens the drawer, Escape closes it, a screenshot, no console errors. |
| 6.2 Visual review | 7 widths, normal and fonts-blocked, Edge and Chrome, states initial, wishlist, drawer, toast, menu, empty. 166 screenshots. Automated checks for overflow, clipping, overlap and glyphs. | Identical in Edge and Chrome: no horizontal overflow, no clipped text, no broken glyphs, fonts-blocked fallback (Times New Roman / Arial) without breakage. Found F1 and F2 (below). **Human visual sign-off is pending.** |
| Fix verification | `fixcheck.js` and `fixcheck_toast.js`: the frozen pre-fix copy against the live app, in the same browser, 7 widths (320, 375, 701, 768, 951, 1024, 1440), Edge and Chrome, normal and fonts-blocked. | See 12.3. |

### 12.2 Defects found and fixed

Both were found in 6.2 and fixed with CSS only, after the owner approved the exact change. `index.html` and `script.js` were not touched.

| ID | Defect | Fix | Trade-off |
|---|---|---|---|
| **F1** | The rotated `.cover` painted over the `.tag` and the `.heart` heart button (both absolutely positioned with `z-index: auto` and earlier in the DOM). The heart collided with the cover wherever the visual box is narrower than the cover plus 78px: below about 424px at 700px and under, and just after the 701 and 951 breakpoints. At 320px the heart was fully hidden and a click landed on the cover (wishlist stayed empty). | `z-index: 1` on `.tag` and on `.heart` | The tag and heart may now cover part of the decorative cover label. Accepted by the owner. |
| **F2** | The Caterpillar cover art `"● ● ●"` is 112.5px wide at 48px, but its box is 88px (700px and under) or 112px (above), so it wrapped to two lines. The children overflowed the fixed-height cover by 63px or 29px, and the title and author spilled out and overlapped the CHILDREN label at 700px and under. | `.caterpillar span { font-size: 32px !important; }` | `!important` is needed only to beat the inline `font-size:48px` that `script.js` writes for every cover. The selector matches exactly one element (the Caterpillar art span). |

### 12.3 Verified results after the fixes

Edge and Chrome gave the same results at all 7 widths, normal and fonts-blocked.

| Check | Before | After |
|---|---|---|
| Hearts topmost at their centre and four inner points | 0/8 at 320 and 375, 8/8 elsewhere | 8/8 at all widths |
| Tags topmost | 0/6 (1/6 at 1440) | 6/6 at all widths |
| Real DevTools click on a heart | Failed at 320 | At every width: `aria-pressed="true"`, glyph ♥, wishlist `[1]`, wishlist badge 1, cart badge 0. A second click toggles it off. |
| Header over a heart scrolled under it | Header wins | Header wins |
| Drawer over cards | 5/5 | 5/5 |
| Toast over cards and over a forced heart or tag overlap | Passes (toast `z-index` 30) | Passes: 25 to 62 of 25 to 62 natural samples and 6/6 forced, in all four runs |
| Caterpillar dots on one line | 2 lines | 1 line |
| Caterpillar child overflow (web fonts) | +63 px (700px and under), +29 px | −21 px, −55 px |
| Caterpillar child overflow (fonts blocked) | +41 px, +9 px | −32 px, −64 px |
| Caterpillar author versus cover bottom | 3 to 51 px below | 12.3 px inside |
| Other seven covers | n/a | Unchanged |
| Console | n/a | No exceptions or console errors. All browser instances shut down gracefully with no leftover processes. |

**Computed-style and geometry differences, pre-fix against post-fix (identical in all four runs):**
- `z-index auto → 1` on `span.tag`, `button.heart` and `button.heart.active`.
- Inside the Caterpillar cover only: the art span `font-size` 48 → 32px. Its `height`, `block-size`, `transform-origin` and `perspective-origin` change with the height. The title and author move up as the span shrinks (105 geometry changes, all inside that subtree).
- No style differences elsewhere. No geometry differences outside the Caterpillar subtree. The `heart::after` hit area is unchanged. Element count and order are identical, and the document size is unchanged in every state.

**A test artifact, not an app defect.** An early version of the toast check reported 28 failures. `#toast` has `pointer-events: none`, so `document.elementFromPoint` can never return it. The check was redone in `fixcheck_toast.js` by injecting `#toast{pointer-events:auto}` into the test page only. The old result files (`fix/fixcheck_*.json`) and `fixcheck_report.js` still contain the 28 flawed lines. They were left as they were.

### 12.4 Regression harnesses after the fixes (headless Edge)

| Suite | Result | Category |
|---|---|---|
| Phase 1 | 61 executed, 51 pass, **10 fail** | Same 10 known failures: S1, S2, S3, S4, S5, S7, D13, D14, N3, N4 (explained in section 9.2). Unchanged. |
| Phase 2 | 61/61 | Pass |
| Phase 3 | 96/96 | Pass |
| Phase 4 | 97/97. Launch tests L1 1/1, L2 2/2, L3 97/97 | Pass |
| Phase 5 `#seeds` | 9/9 | Pass |
| Phase 5 `#behave` | 3/3 | Pass |
| Phase 5 `#fail` | 5/5 | Pass |
| Phase 5 `#static` | 13/14 (C1 fails) | Intentional, see 12.5 |
| Phase 5 `#focus` | 1/4 (F375, F1000, F1440 fail) | Intentional, see 12.5 |
| Phase 5 `#layout` | 0/17 (every `C<width>` fails) | Intentional, see 12.5 |
| Phase 5 `#touch` | 2/7 (T320, T481, T768, T1000, T1440 fail) | Intentional, see 12.5 |

Phase 5 in total: 59 executed, 33 pass, 26 fail. **All 26 are intentional baseline differences. There are no unexpected regressions.** The same four Phase 3 and Phase 4 groups at section 11.1 counts were not re-run in Chrome after the fixes. After the fixes, only Edge was used for the harnesses.

### 12.5 Why the Phase 5 baseline now differs (intentional)

The Phase 5 harness compares the live app against the frozen pre-refactor files in `_verify/phase5_baseline/`. It was designed to find any difference, so the three CSS edits in 12.2 make it report differences. They are expected.

- **C1** (declaration multiset): `only-baseline = []`. `only-new` is exactly `.caterpillar span font-size: 32px !important`, `.heart z-index: 1`, `.tag z-index: 1`. 1,436 declarations became 1,439.
- **`#layout`, `#touch`, `#focus`:** the failure messages the harness prints (574 of 2,508 stated differences) were sorted into F1 and F2 categories: 213 heart z-index, 157 tag z-index, and the Caterpillar span, title, author, cover and visual-box sizes. **0 fell outside F1 and F2.** The harness prints at most 25 messages per test, so the remaining 1,934 differences are not itemised.
- **Control:** the same four groups run with the frozen pre-fix copy as the "new" side (`#…&new=phase6/prefix`) pass 42/42 (`#static` 14, `#layout` 17, `#focus` 4, `#touch` 7). So the harness itself is sound, and the failures come from the three edits.
- `_verify/phase5_baseline/` and `phase5_harness.html` were not modified. They are kept as evidence.

### 12.6 Observations not fixed (by decision, not defects)

From the 6.2 review, recorded in `_verify/phase6/visual/observations_6.2.md`:
- F3: the author line on dark covers has low contrast.
- F4: the hero book stack overlaps and clips by design.
- F5: the header grows to 164px at 320px (Bag and search wrap).
- F6: the menu wraps to two rows at 320px.
- F7: the header is 95% translucent by design.
- F9: minor spacing differences.
- The Midnight Library cover has a 4px internal overflow at 320px and 375px (inside the cover box).

### 12.7 Superseded statements (older sections are left as written)

- **Sections 11.1, 11.6, 11.8:** the Phase 5 differential harness result "59/59", "no differences in CSS declarations or computed layout" and the `styles.css` hash `0DCAC489` describe the file before the F1/F2 fix. The current `styles.css` is `52502A15` and intentionally differs from the baseline (12.5). Phase 5 now reads 33/59, all differences intentional.
- **Section 11.7 and earlier "other browsers pending" lines:** Chrome was run (headless, via DevTools, 12.1 and 12.3) for the visual review and the fix checks. Chromium-based coverage only. Firefox and Safari are still pending.
- **Earlier "styles.css has 1,022 lines" (section 11.5):** it now has 1,030.

### 12.8 Not performed (all pending)

Steps **6.3 to 6.9** were not run. In particular:
- **6.3** Hover and active states with real mouse input, computed styles and a layout-shift check.
- **6.4** Real keyboard input through `Input.dispatchKeyEvent`: Tab order at 3 widths, drawer focus trap and focus return, newsletter Enter-submit, focus-ring screenshots (including the heart's ring after `z-index: 1`).
- **6.5** Accessibility tree, real `prefers-reduced-motion` emulation, 640px and 320px reflow checks.
- **6.6** A fuller Edge and Chrome compatibility pass.
- **6.7** Touch emulation (`pointer: coarse`, 44px targets, taps).
- **6.8** Persistence across normal browser restarts, two-tab sync, back and forward, clear-site-data, incognito.
- **6.9** The planned status ledger and manual test sheet. This section 12 is a smaller substitute.

Also pending:
- Post-fix screenshots were **not** re-captured. The 166 screenshots in `_verify/phase6_shots/` are pre-fix evidence for F1 and F2.
- Firefox and Safari.
- A real phone or tablet, including Safari's address bar with the sticky header.
- Screen readers.
- Physical keyboard and mouse feel.
- Human visual sign-off.
- Post-fix harness runs in Chrome.
- A dedicated check that nothing loads externally except the Google Fonts `@import`. It was not run. The only related evidence is that the driven runs logged no console errors.

### 12.9 Files

- **Application (final):** `index.html` (`E00A97AE`, unchanged since Phase 5), `script.js` (`A4B22457`, unchanged since Phase 5), `styles.css` (`52502A15`, changed for F1 and F2 only).
- **Unchanged in Phase 6 closeout:** `README.md` (`0225CACF`), `.gitignore` (`71396B05`).
- **Changed in closeout:** this file (section 12 appended).
- **Phase 6 assets (all under the git-ignored `_verify/`):** `_verify/phase6/` (driver, runner, visual and fix scripts and results, `regress/` harness outputs, and `prefix/`, the frozen pre-fix copies), `_verify/phase6_shots/` (166 PNGs). Nothing was deleted or overwritten. Temporary browser profiles were removed.
- **Browsers used:** Edge 157.0.4341.60 and Chrome 157.0.8103.79, headless, with temporary profiles. The user's own Chrome and Edge processes were not touched.
