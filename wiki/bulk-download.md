# Bulk Certificate Download

Bulk download is protected by a password. When the correct password is entered, all certificate files are fetched and zipped in the browser using JSZip, then downloaded as a single ZIP file.

- Button: 'Bulk Certificate Download'
- Password is set in `script.js` (`BULK_PASSWORD`)
- Uses JSZip (CDN included in `index.html`)
- Requires running on a local server (not file://)
