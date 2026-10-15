FileSaathi - your private document vault
========================================

Add photos, screenshots, PDFs and text files. FileSaathi reads each one,
names it clearly (e.g. 2026-10-02_Electricity-Bill_JVVNL.pdf) and files it
into a master folder and sub-folder with its dates. With Google Drive sync,
the same vault is on every phone and computer you use.

START HERE: open SETUP-GUIDE.txt. It walks you through:
  A. Putting the app on GitHub Pages (free web address)
  B. Creating a Google Client ID (for Drive sync)
  C. Connecting the app to your Google Drive
  D. Installing it on your phone and other devices
  E. Optional: AI reading with a Claude API key

Quick try without setup: double-click index.html. It works on that computer
only (no install, no sync) until you finish the guide.

Files in this ZIP (all in one place, no sub-folders)
  index.html             the app
  config.js              your Google Client ID (step C)
  sw.js                  lets the app install, work offline and update itself
  manifest.webmanifest   app name, icons and screenshots for installing
  icon-*.png, favicon    app icons
  *.min.js, *.wasm.js    built-in tools for PDFs, ZIPs and reading text offline
  *.traineddata.gz       English and Hindi text-reading data
