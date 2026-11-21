AURUM LUXE SALON - 3D luxury salon website with owner login, bookings and admin panel

FILES
  index.html     the public salon website
  admin.html     owner login and admin panel
  css/, js/      styles and scripts
  data/data.json services, gallery photos and salon details (edited by the admin panel)
  server.js      option A: run with Node.js
  api.php        option B: for PHP hosting (cPanel and similar)

WHAT THE ADMIN PANEL DOES
  - Owner login with a password
  - Booking requests from the website appear in the admin panel automatically
    (refreshes every 20 seconds). Mark them Confirmed or Done, or delete them.
  - Edit salon name, headline, phone, WhatsApp number, address and hours
  - Add, edit and delete services and prices
  - Upload and remove gallery photos (resized automatically)

FIRST: CHANGE THE ADMIN PASSWORD
  Option A: start with  ADMIN_PASSWORD=your-password node server.js
  Option B: open api.php and change  $PASSWORD = 'change-me';

OPTION A - NODE.JS (own server, VPS, or a Node host)
  1. Install Node.js 18 or newer.
  2. In this folder run:  ADMIN_PASSWORD=your-password node server.js
     (Windows PowerShell:  $env:ADMIN_PASSWORD="your-password"; node server.js)
  3. Open http://localhost:3000 and http://localhost:3000/admin.html
  Bookings are stored in data/bookings.json (never served to the public).

OPTION B - PHP HOSTING
  1. Edit the password in api.php.
  2. Upload everything except server.js to public_html.
  3. Make the data/ folder and data/data.json writable by the web server (folder 755 or 775).
  4. Open yourdomain.com/admin.html
  Bookings are stored in data/bookings.php, which is protected from web access.

STATIC HOSTING ONLY (no PHP or Node)
  The website still works. Bookings fall back to WhatsApp (if you set a number) or ask
  the guest to call. The admin panel lets you edit, then Download data.json and upload
  it to the data/ folder.

NOTES
  - Use HTTPS on a live site, because the password is sent when you log in.
  - Use the server to test; do not open index.html by double-clicking.
  - There is no SMS or email OTP login. It needs an SMS or email provider account.
  - Back up the data/ folder regularly.
