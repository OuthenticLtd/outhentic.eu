OUTHENTIC WEBSITE — UPLOAD INSTRUCTIONS
==========================================

A complete static website. No build step. Drag and drop.

PAGES
-----
  index.html        Landing chooser (Group / Foundation split screen) — homepage
  group.html        Outhentic Group — the band
  foundation.html   Outhentic Foundation — the NGO
  favicon.ico       browser tab icon
  assets/css/       single shared stylesheet (styles.css)
  assets/js/        small JS for nav, lightbox, lazy YouTube
  assets/img/       logo + all photos


HOW TO UPLOAD TO HOSTINGER
--------------------------
Option A — File Manager (easiest):
  1. Log into hPanel at https://hpanel.hostinger.com
  2. Open File Manager for outhentic.eu
  3. Go into the public_html folder
  4. Select all existing files there and DELETE them (or move to "old_wp_backup" first)
  5. Drag this entire folder's contents into public_html — everything at this top level:
     index.html, group.html, foundation.html, favicon.ico, the assets folder, README.txt
  6. Visit https://outhentic.eu/ to verify

Option B — FTP / FileZilla:
  1. Connect with your Hostinger FTP credentials
  2. Navigate to /public_html, empty it (or back up first)
  3. Upload everything from this folder, preserving the folder structure


URL STRUCTURE AFTER UPLOAD
--------------------------
  https://outhentic.eu/                  Landing chooser
  https://outhentic.eu/group.html        The band
  https://outhentic.eu/foundation.html   The Foundation


HOUSEKEEPING BEFORE GOING LIVE
------------------------------
1. Photo folders contain a few `.jpg~` backup files left over from the image
   resize step. They are harmless but you can right-click and delete them in
   File Explorer to keep the folder clean. The actual `.jpg` files next to
   them are the optimized ones used by the site.

2. Footer social links use placeholder URLs:
       https://www.facebook.com/outhentic
       https://www.instagram.com/outhentic
       https://www.youtube.com/@outhentic
   Open group.html and foundation.html, search for "facebook.com/outhentic"
   and update to your real handles.

3. The three YouTube videos on the Music section come from your brochure
   (IDs nl6R4I01z8Q, p_ZrRfEyIk4, W6jgDDaKkxg). Search for "data-yt" in
   group.html if you'd like to swap any.

4. Alexandrina Vasileva's team photo on foundation.html is a geometric
   placeholder. To replace it, drop a portrait JPG into
       assets/img/foundation/alexandrina.jpg
   then in foundation.html find the comment "Placeholder for Alexandrina"
   and swap the <svg>...</svg> block for:
       <img src="assets/img/foundation/alexandrina.jpg" alt="Alexandrina Vasileva portrait" loading="lazy"/>

5. The IBAN, BIC and bank details on foundation.html come from your
   brochure. Verify they are still current; if not, edit the dl block under
   "Bank transfer".


WHAT IS BUILT INTO THE SITE
---------------------------
- Sticky top navigation with mobile hamburger (collapses below 820 px)
- Hero on group.html and foundation.html with full-bleed photo
- Discography block with 2 albums + 3 lazy-loaded YouTube videos
- Members grid with 4 portraits (group) / 3 portraits (foundation)
- Live performance gallery with click-to-zoom lightbox
  (X button, Escape key, or click outside to close)
- Project list with 9 funded projects (2018-2020)
- Dedicated ETHNO Bulgaria section with the 2023 first-edition history
- Bank transfer details on a dark themed donation card
- Reveal-on-scroll animations
- Respects prefers-reduced-motion
- All images have alt text; semantic landmarks throughout


EDITING
-------
Open any .html or .css file in any plain-text editor — Notepad, VS Code,
Sublime, anything. Each section is clearly delimited with HTML comments
like:
    <!-- ============== HERO ============== -->
so you can find what you want fast.


TROUBLESHOOTING
---------------
If something looks broken after upload: hard-refresh the page
(Ctrl+F5 on Windows / Cmd+Shift+R on macOS) to bust any cached old version.
Hostinger sometimes serves cached HTML for a few minutes after replacement.

If a photo does not show: check the file path matches exactly. Hostinger's
filesystem is case-sensitive — `Photo.jpg` and `photo.jpg` are different
files. The site uses lowercase filenames throughout.

If the layout looks completely unstyled: confirm `assets/css/styles.css`
uploaded correctly. Open the browser's DevTools (F12) > Network tab,
reload, and check that styles.css returns 200 (not 404).


CONTACT
-------
For Outhentic: info@outhentic.eu / Sofia 1592, Bulgaria
