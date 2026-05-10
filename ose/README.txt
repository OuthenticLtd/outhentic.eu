OSE — outhentic.eu/ose
======================================

A self-contained sub-site for the Outhentic Sound Engine (OSE) Android app.
Lives inside the outhentic.eu repo as a sibling folder; the parent site is
NOT modified. Public URL after deploy: https://outhentic.eu/ose/

STRUCTURE
---------
  index.html              Landing page (hero, 8-module grid, pitch, CTA)
  manual.html             Manual hub — links to every module page
  tutorials.html          Task-first step-by-step tutorials
  help.html               FAQ + troubleshooting
  privacy.html            Privacy policy (GDPR)
  terms.html              Terms of use
  editor.html             Password-gated content editor (matches outhentic.eu/editor.html)
  404.html                Not-found page

  modules/
    play.html             Play Module — synth + instruments (Play Hub)
    audio.html            Audio Module — Recorder lens + Library lens + Audio Editor
    midi.html             MIDI Module — Piano Roll Editor
    practice.html         Practice Module
    metronome.html        Metronome
    tuner.html            Tuner
    signal-generator.html Signal Generator
    meters.html           Meters

  assets/
    css/ose-styles.css    Shared stylesheet (app design language)
    js/
      ose-renderer.js     Renders ose-content.js into pages
      ose-main.js         Nav, scroll, mobile menu, lazy reveals
      editor-github.js    GitHub direct save (reused pattern from parent)
    data/
      ose-content.js      ALL editable text/images — single source of truth
    img/
      ose-logo.svg        Vector logo (used as primary favicon)
      ose-logo.png        Bitmap logo (drop the 2600×2600 master here)
      mockups/            SVG mockups of each module screen (replaceable)

  sitemap.xml
  robots.txt              /ose/ specific (parent has its own)


HOW THE EDITOR WORKS
--------------------
  1. Open https://outhentic.eu/ose/editor.html
  2. Enter password (default: change PASSWORD_HASH inside editor.html)
  3. Edit any field — everything is wired to the same JS data file
  4. Click "Save to GitHub" (after pasting a fine-grained PAT once) OR
     click "Download ose-content.js" and upload it to /ose/assets/data/
     manually
  5. The site re-renders on next page load


FAVICON + BRAND ASSETS
----------------------
The site uses the canonical OSE brand mark — same SVG that's in the app
repo at branding/ose_logo.svg. Source of truth lives there; this folder
holds a synced copy.

  /ose/assets/img/ose-logo.svg   ← canonical mark (matches app + Android splash)
  /ose/assets/img/ose-logo.png   ← optional bitmap fallback (drop your master here)
  /ose/assets/img/ose-og.svg     ← Open Graph card (1200×630), used for link previews

If the canonical SVG ever changes in the app repo, copy these over:
  branding/ose_logo.svg                       → /ose/assets/img/ose-logo.svg
  branding/marketing/og_image_1200x630.svg    → /ose/assets/img/ose-og.svg

Modern browsers render the SVG favicon directly; the PNG is the fallback
for older clients that don't support SVG icons.


DEPLOY
------
This folder is committed alongside the parent outhentic.eu site under the
/ose path. After git push, https://outhentic.eu/ose/ goes live with the
parent site untouched.


CONTACT
-------
For OSE: info@outhentic.eu
