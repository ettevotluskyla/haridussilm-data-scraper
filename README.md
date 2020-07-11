# evk-edu-data
Import data about the number of students in each class for schools into a Google Sheet.

Note: This is not meant for public use and the code is very sloppy, so at least for the time being, it has a very high chance of breaking. I'm still learning puppeteer, so the code is not high quality at all.


## Common issues
### Puppeteer asking for firewall permissions

Run the following command, where "mac-version" is replaced with the version of chromium downloaded.

```alias sign_puppeteer="sudo codesign --force --deep --sign - ./node_modules/puppeteer/.local-chromium/mac-version/chrome-mac/Chromium.app"```
