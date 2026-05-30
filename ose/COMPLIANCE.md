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
- [~] **Target API level.** Google Play requires **new apps and updates to target Android 15 (API 35)** as of 2026; **from 31 Aug 2026, API 36 (Android 16)** is required for new submissions/updates. TODO: confirm `targetSdkVersion` in the app's `build.gradle` is ≥ 35 (≥ 36 if submitting after 31 Aug 2026). Not verifiable from this repo.
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
- [ ] **TODO (main session — page `<head>` edits, not done here by request):** on every other HTML page (`index.html`, `manual.html`, `tutorials.html`, `help.html`, `privacy.html`, `terms.html`, and all `modules/*.html`):
  1. Remove the two `preconnect` links and the `fonts.googleapis.com/css2?...` stylesheet `<link>`.
  2. Add `<link rel="stylesheet" href="assets/css/ose-fonts.css" />` (root pages) or `href="../assets/css/ose-fonts.css"` (module pages), placed **before** `ose-styles.css`.
  3. Step-by-step detail is in the header comment of `assets/css/ose-fonts.css`.

## 6. Bulgaria — supervisory authority

**Commission for Personal Data Protection (CPDP / Комисия за защита на личните данни — КЗЛД)**
- Address: 2 Prof. Tsvetan Lazarov Blvd., Sofia 1592, Bulgaria
- Email: kzld@cpdp.bg · Phone: +359 2 915 3519
- Website: https://www.cpdp.bg/en/

Published in the privacy policy (section 11) as the Art. 77 complaint route.

## 7. Pricing / marketing copy hygiene (NEVER state figures)

Pricing is dynamic and must not appear anywhere user-facing.

- [x] **`ose-content.js`** — "paid sound packs" copy neutralised to "additional sound packs" (highlights block).
- [ ] **TODO (main session) — `"price":"0","priceCurrency":"EUR"` in structured data (`application/ld+json` `Offer` blocks):** present in `index.html` (lines ~86, 107, 122, 137) and in `modules/play.html`, `modules/metronome.html`, `modules/signal-generator.html` (each ~line 43). These were **not** edited because `index.html` and `modules/*` are owned by the main session. Recommend removing the `offers` object entirely (a `SoftwareApplication` is valid without it) rather than asserting a zero price, since price is dynamic and a stated price can become inaccurate and is a (minor) consumer-information risk.
- [ ] **TODO (main session) — "Free to install" copy** in `index.html` (~line 349): "Free to install. No account needed. No data collection. Your music stays on your device." Recommend dropping "Free to install." and keeping the privacy-positive sentences ("No account needed. No data collection. Your music stays on your device."). Flagged, not edited (off-limits file).

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
