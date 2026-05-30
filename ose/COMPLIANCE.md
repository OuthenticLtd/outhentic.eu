# OSE — Legal & Compliance Checklist

**Scope:** the OSE Android app (Outhentic Sound Engine) and the website `outhentic.eu/ose`.
**Controller:** Outhentic Ltd., Druzhba 72, vh. D, ap. 95, Sofia 1592, Bulgaria. UIC 204923841 · VAT BG204923841 · ose@outhentic.eu.
**Last reviewed:** 2026-05-30.

Status key: `[x]` done · `[~]` done with a follow-up note · `[ ]` TODO.

---

## 1. Google Play launch readiness

- [x] **Privacy policy URL is live and standalone.** `https://outhentic.eu/ose/privacy.html` — referenced in `AndroidManifest.xml` (`meta-data ose.privacy_policy_url`) and to be set in the Play Console store listing. Now a full GDPR policy (controller, no-collection statement, per-permission purposes, rights, CPDP complaint route, fonts disclosure, future-billing clause).
- [x] **Data Safety form answers prepared (see section 2).** Consistent with the policy: **No data collected, No data shared.**
- [x] **Permissions justified.** Every manifest permission maps to an on-device purpose and is documented in the privacy policy section 3 and in the app memory memo. No INTERNET permission is declared (verified in manifest — none present).
- [x] **Target API level.** Confirmed `targetSdk = 35` in `app/build.gradle.kts` — meets the current Google Play requirement (new apps/updates must target Android 15 / API 35). NOTE: from **31 Aug 2026**, new submissions/updates must target **API 36 (Android 16)** — bump `targetSdk` to 36 before submitting after that date.
- [ ] **Content rating / IARC questionnaire.** Must be completed in Play Console. Expected outcome: suitable for everyone / PEGI 3 / ESRB Everyone — a music utility with no user-generated public content, no ads, no purchases (today), no objectionable content. Answer the questionnaire honestly; no in-app social features.
- [x] **Account deletion requirement: N/A.** Google's account-deletion policy applies only to apps that let users create an account. OSE has no accounts and collects no data, so no in-app or web account-deletion flow is required. State this in the Data Safety / policy as "no account".
- [~] **Foreground service declaration.** Manifest declares `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, and two services with `foregroundServiceType="mediaPlayback"`. Play requires a **foreground-service-use declaration** in the Play Console (describe the media-playback use: Signal Generator + media playback notification). TODO: complete that declaration form in the Console at submission. A short screen recording showing the playback notification helps approval.
- [x] **Families / children policy.** App is general-audience, not directed at children, collects no data. Do **not** opt into the Designed-for-Families program (it isn't a kids' app). Content rating set accordingly. No ads, so ad-related families rules don't apply.
- [x] **Photo/Video & broad-storage permissions.** App uses `READ_MEDIA_AUDIO` (audio only) + legacy storage gated by `maxSdkVersion`. No `READ_MEDIA_IMAGES/VIDEO`, no `MANAGE_EXTERNAL_STORAGE` — so the sensitive "all files access" / Photo-and-Video-permissions policies do not apply. Keep it that way.
- [x] **Location permissions sensitive-data review.** `ACCESS_FINE/COARSE_LOCATION` are declared with `maxSdkVersion=30` only (legacy BLE-scan gate) and `BLUETOOTH_SCAN` carries `neverForLocation`. App never derives location. Be ready to explain this in the Console permissions declaration if prompted; the manifest comments document it.
- [ ] **App signing & integrity.** Use Play App Signing. (Process item — not a content task.)
- [x] **No ads / no billing today.** Data Safety, content rating, and policy all reflect this. Update all three **before** enabling Google Play Billing (see section 5 follow-ups).

## 2. Google Play Data Safety — prepared answers

> Even a no-data app must complete the form and link a privacy policy. Google defines "collection" as data **sent off the device**; on-device-only access is **not** collection.

- **Does your app collect or share any of the required user data types?** → **No.**
- **Data collected:** none. **Data shared:** none.
- **Is all data encrypted in transit?** → N/A (no data leaves the device).
- **Can users request data deletion?** → N/A (no data collected; no account).
- **Data types — Location, Personal info, Financial, Messages, Photos/Videos, Audio files, Contacts, Calendar, App activity, Device IDs, etc.:** → all **No** (microphone/audio/MIDI processed on-device only; no Android Advertising ID; no `ANDROID_ID` read by any SDK).
- **Third-party SDKs:** none that collect/transmit data. (Re-verify if any analytics/ads/crash SDK is ever added.)
- **Privacy policy URL:** `https://outhentic.eu/ose/privacy.html`.
- **Committed to Play Families policy?** Only if targeting children — **not** applicable here.

## 3. EU GDPR (Regulation (EU) 2016/679)

- [x] **Controller identity & contact** published in the privacy policy (Outhentic Ltd., full address, UIC/VAT, email).
- [x] **Lawful basis.** App: no processing of personal data, so no basis needed. Website newsletter: **consent** (Art. 6(1)(a)), via the user choosing to send the pre-filled email; withdrawable any time.
- [x] **Transparency (Arts. 12–14).** Plain-language policy describing what is/isn't processed and why.
- [x] **Data-subject rights (Arts. 15–22)** listed: access, rectification, erasure, restriction, objection, portability, withdraw consent. Response within one month.
- [x] **Right to lodge a complaint (Art. 77).** CPDP details published (see section 6) plus the user's home-country authority.
- [x] **Data minimisation / privacy by design.** App is offline by design; site sets no cookies; newsletter has no server-side store.
- [x] **International transfers.** None initiated by us; documented. (Hosting provider technical logs noted.)
- [x] **Children.** No knowing processing of children's data; app collects nothing from anyone.
- [~] **Records of processing (Art. 30).** Minimal: only newsletter emails received via the mailto inbox. Keep an informal note of where those emails are stored (the ose@outhentic.eu mailbox) and delete on unsubscribe request. A DPO is **not** mandatory for this scale.
- **DPA / processor agreements:** none required for the app. If a newsletter ESP (Mailchimp/Brevo/etc.) is adopted, sign a Data Processing Agreement and update the privacy policy (see section 5).

## 4. ePrivacy / cookies (Directive 2002/58/EC, as implemented in BG)

- [x] **No cookies, no trackers, no analytics on the website.** No Art. 5(3) consent banner needed — confirmed in code (static site; only an admin-only `localStorage` token that is strictly necessary and never set for visitors).
- [x] **Cookie statement published** at `cookies.html` (new page) and linked from the footer "Legal" column and the privacy policy.
- [x] **Newsletter** uses a `mailto:` fallback (no server endpoint, `endpointUrl` empty in `ose-content.js`) — confirmed in `assets/js/ose-newsletter.js`. No pre-checked boxes; user actively sends the email = consent.

## 5. Google Fonts / third-party CDN exposure (GDPR)

EU case law (LG München, 20 Jan 2022, **3 O 17493/20**) holds that loading Google Fonts from Google's CDN transmits the visitor's IP address to Google (US) and is unlawful processing without a legal basis. The site currently loads Inter + JetBrains Mono from `fonts.googleapis.com` / `fonts.gstatic.com` on its HTML pages.

- [x] **Self-hosted font files added** under `assets/fonts/` (4 woff2: Inter + JetBrains Mono, variable, latin + latin-ext subsets — SIL OFL 1.1, free to self-host).
- [x] **`assets/css/ose-fonts.css` created** with `@font-face` rules (family names unchanged, so `ose-styles.css` needs no edit).
- [x] **`cookies.html` already uses the self-hosted setup** (no Google `<link>`).
- [x] **DONE — page `<head>` font wiring.** Every HTML page (`index`, `manual`, `tutorials`, `help`, `404`, `terms`, `privacy`, `editor`, all `modules/*.html`, `cookies`) now links `ose-fonts.css` and the Google Fonts `preconnect` + CSS `<link>`s have been removed. Verified: zero references to `fonts.googleapis.com` / `fonts.gstatic.com` remain. No visitor IP is sent to Google.

## 6. Bulgaria — supervisory authority

**Commission for Personal Data Protection (CPDP / Комисия за защита на личните данни — КЗЛД)**
- Address: 2 Prof. Tsvetan Lazarov Blvd., Sofia 1592, Bulgaria
- Email: kzld@cpdp.bg · Phone: +359 2 915 3519
- Website: https://www.cpdp.bg/en/

Published in the privacy policy (section 11) as the Art. 77 complaint route.

## 7. Pricing / marketing copy hygiene (NEVER state figures)

Pricing is dynamic and must not appear anywhere user-facing.

- [x] **`ose-content.js`** — "paid sound packs" copy neutralised to "additional sound packs" (highlights block).
- [x] **DONE — structured-data `Offer`/price removed.** All `"price":"0","priceCurrency":"EUR"` `Offer` blocks were stripped from `index.html` and `modules/{play,metronome,signal-generator}.html`. Verified: no `"price"` remains in any page; JSON-LD still parses.
- [x] **DONE — "Free to install" copy removed** from `index.html`; the privacy-positive sentences ("No account needed. No data collection. Your music stays on your device.") were kept.

## 8. Follow-ups for when licensing / billing lands (PLANNED, not built)

The planned trial/licensing system (Google Play Billing, Play Integrity, Firebase App Check, Firestore) will introduce data processing. **Before it ships:**

- [ ] Update the **privacy policy**: add Google Play Billing as processor for purchases; describe Play Integrity / Firebase App Check signals (device/app integrity tokens), Firestore data stored, retention, and the legal basis (contract / legitimate interest).
- [ ] Re-do the **Play Data Safety** form: it will no longer be "no data collected" (purchase history, possibly device IDs, app-integrity data).
- [ ] Add **INTERNET** permission and re-justify any new permissions.
- [ ] Sign **DPAs** with Google (Firebase) and confirm SCCs / transfer mechanism for any US transfer.
- [ ] Add an **account-deletion path** if user accounts are introduced (Play requirement), or document why entitlement records aren't tied to an account.
- [ ] Update **Terms** section 7 (Purchases) with concrete terms and EU consumer withdrawal/refund handling.

---

### Files created/changed in this pass (website)
- `assets/data/ose-content.js` — rewrote `privacy_html`, `terms_html`; added `cookies_html`; added Cookie footer link; neutralised "paid sound packs".
- `assets/js/ose-renderer.js` — added `data-ose-cookies` binding.
- `cookies.html` — new page (uses self-hosted fonts).
- `assets/css/ose-fonts.css` — new self-hosted @font-face sheet.
- `assets/fonts/*.woff2` — 4 new self-hosted variable font files.
- `COMPLIANCE.md` — this file.

---

## 9. Legal hardening pass — 2026-05-30 (cookie notice, imprint, accessibility, audit)

### 9.1 Third-party / cookie / tracking re-audit — RESULT: CLEAN
Grepped every page + JS for `<iframe>`, `<embed>`, `gtag`, `google-analytics`, `googletagmanager`, `fbq`, `facebook`, `hotjar`, `clarity`, `plausible`, `matomo`, `youtube`, `vimeo`, `maps.google`, `document.cookie`, `localStorage`, `sessionStorage`, external `<script src>` / `<link href=http…>`.

- **No analytics, no ad/tracking pixels, no social embeds, no third-party iframes/embeds, no `document.cookie`, no `sessionStorage`** anywhere in production pages or JS.
- **Only external resource in production HTML:** `editor.html` loads Quill (`cdn.jsdelivr.net`). This is the **admin-only**, password-gated content editor — not a visitor page — and is intentionally left as-is and **not** given the consent script. Acceptable: no visitor is ever served third-party requests.
- **`localStorage` usage:** (a) `editor-github.js` — admin GitHub token, gated by `#editor`, never set for visitors; (b) `ose-consent.js` — a single strictly-necessary dismissal flag (`ose-cookie-notice-dismissed`). Both are strictly necessary and exempt from consent under ePrivacy Art. 5(3). No visitor-tracking storage exists.
- **Google Fonts:** confirmed still self-hosted; the only `fonts.googleapis.com` references are in `_tmp_shots/` dev-scratch files that are **not deployed pages** (screenshot harnesses). No production page sends a visitor IP to Google.
- **No price/Offer JSON-LD** reintroduced (per section 7).

### 9.2 Cookie / storage notice banner — `assets/js/ose-consent.js` (NEW)
Self-contained, honest, dismissible bottom banner injected on `DOMContentLoaded`. Text: "No tracking here. We use no advertising or tracking cookies — only storage that is strictly necessary for the site to work. Learn more." + "Got it" button + link to `cookies.html` (path auto-resolves `../` on module pages via `data-module-id`). Dismissal remembered in one strictly-necessary `localStorage` flag — **not a consent gate** (there is nothing non-essential to consent to). Injects its own scoped styles using the site's dark theme + accent gradient + Inter; honours `prefers-reduced-motion`; storage wrapped in try/catch. Added as `<script … defer>` before `</body>` on **all 17 production pages** (9 root + 8 modules); `editor.html` intentionally excluded.

### 9.3 Legal Notice / Imprint — `legal-notice.html` (NEW)
Per EU e-Commerce Directive 2000/31/EC Art. 5 + Bulgarian Electronic Commerce Act. Content block `legal_notice_html` in `ose-content.js`, rendered via new `data-ose-legal-notice` binding. Contains: legal name (Outhentic Ltd. / ЕООД), registered address, **UIC/ЕИК 204923841**, **VAT BG204923841**, statement of registration in the Commercial Register (Търговски регистър, Registry Agency) with public-lookup link, representation by manager(s), email contact, CPDP as data supervisory authority, EU ODR platform note, hosting (GitHub Pages / GitHub, Inc. — Microsoft, US), Google Play distribution note, liability-for-links and copyright clauses.

### 9.4 Accessibility Statement — `accessibility.html` (NEW)
Per European Accessibility Act (Directive (EU) 2019/882, applicable 28 Jun 2025). Content block `accessibility_html`, rendered via new `data-ose-accessibility` binding. Targets **WCAG 2.1 AA** (the level referenced by EN 301 549; WCAG 2.2 not yet in the harmonised standard — verified via web). Honest, non-overclaiming: states "partially conformant", lists what's done, **known limitations** (decorative mockups, reduced-motion review, un-audited long pages), feedback/contact = **ose@outhentic.eu** (one-month response), enforcement signposting, preparation date 30 May 2026.

### 9.5 Privacy / Terms / Cookies strengthened (no regressions)
- **Privacy** (`privacy_html`): added **§9 Data retention** (newsletter email kept until unsubscribe; no other personal data; logs under host's policy), **§10 Security** (HTTPS, no data stores), **§11 No automated decision-making** (Art. 22); strengthened hosting/transfer disclosure with **GitHub = Microsoft/US + SCCs + EU–US DPF**; clarified how to **exercise rights / withdraw consent** (free, one month, reply-to-unsubscribe); cross-link to Legal notice. Sections renumbered 9→17. Kept CPDP route, future-billing clause, minors clause, effective/last-updated dates.
- **Cookies** (`cookies_html`): now documents **both** strictly-necessary `localStorage` items (visitor dismissal flag + admin editor token), reiterates no cookies at all, self-hosted fonts, GitHub hosting.
- **Terms**: already covered governing law (Bulgaria/EU), EU-consumer liability limits, IP ownership, acceptable use, "as is", Google Play distribution — left intact.

### 9.6 Footer Legal column
`ose-content.js` footer "Legal" column now links: Privacy, Terms, Cookies, **Legal notice**, **Accessibility**. (Replaced the prior "Outhentic.eu" external link with the two new statutory pages; outhentic.eu still reachable via the footer-bottom site link.)

### Files created/changed in THIS pass
- `assets/data/ose-content.js` — added `legal_notice_html`, `accessibility_html`; strengthened `privacy_html` (retention/security/Art.22/transfer/rights) & `cookies_html`; updated footer Legal column.
- `assets/js/ose-renderer.js` — added `data-ose-legal-notice` + `data-ose-accessibility` bindings.
- `assets/js/ose-consent.js` — NEW cookie/storage notice banner.
- `legal-notice.html`, `accessibility.html` — NEW pages (mirror `privacy.html` structure, self-hosted fonts, consent script).
- All 17 production HTML pages — added `ose-consent.js` include before `</body>`.
- `COMPLIANCE.md` — this section.

### Residual recommendations (not blocking)
- The EAA enforcement paragraph signposts "the competent Bulgarian authority" generically; once the specific Bulgarian EAA market-surveillance body is officially designated/published, name it explicitly in `accessibility_html`.
- Verify the Bulgarian-language requirement: if the site/app is offered to Bulgarian consumers, consider a BG translation of the legal notice, privacy and accessibility statements (EAA statements need only cover languages of service; e-commerce/consumer law may expect BG).
- Confirm GitHub's current DPF certification status before relying on the DPF wording long-term (SCCs remain the fallback regardless).
- `_tmp_shots/` contains dev-scratch HTML that loads Google Fonts from the CDN — harmless (not deployed) but consider deleting the folder before publishing to avoid confusion.
