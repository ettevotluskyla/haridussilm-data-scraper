# Data Scraper for HaridusSilm
Imports data for primary, middle and high schools from the Estonian education data portal [HaridusSilm](https://haridussilm.ee).

Because the interface does not easily give access to all data, this script uses Puppeteer to simulate a user making the necessary inputs on the site.

Note: While the repository is public, the program itself is meant for internal use and has a high chance of breaking.




## Known issues
### Persistent firewall permissions popup on macOS

This occurs because the chromium package that's used by puppeteer is not signed, a popup is shown to the user to notify them about it.
The solution is to sign the package yourself, which can be done with the command below.

Run the following command, where "mac-version" is replaced with the version of chromium downloaded.

```alias sign_puppeteer="sudo codesign --force --deep --sign - ./node_modules/puppeteer/.local-chromium/mac-version/chrome-mac/Chromium.app"```
