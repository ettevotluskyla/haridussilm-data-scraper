# evk-edu-data
Import data about the number of students in each class for schools into a Google Sheet.


## Common issues
### Puppeteer asking for firewall permissions

Run the following command, where "mac-version" is replaced with the version of chromium downloaded.

```alias sign_puppeteer="sudo codesign --force --deep --sign - ./node_modules/puppeteer/.local-chromium/mac-version/chrome-mac/Chromium.app"```
