# Troubleshooting

## Bulk Download Not Working
- Make sure you are running the project on a local server (not opening index.html directly).
- All certificate files must exist in the `certificates/` folder and be listed in the `allCertificates` array in `script.js`.
- JSZip must be included in `index.html`.

## Password Not Working
- Check the value of `BULK_PASSWORD` in `script.js`.
- Password is case-sensitive.
