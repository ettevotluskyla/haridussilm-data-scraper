# Data Scraper for HaridusSilm

Imports data for primary, middle and high schools from the Estonian education data portal [HaridusSilm](https://haridussilm.ee).

Because the interface does not easily give access to all data, this script uses Puppeteer to simulate a user making the necessary inputs on the site.

Note: While the repository is public, the program itself is meant for internal use and has a high chance of breaking.


## Running the program

## Defaul options

To run the program with sharding and monitoring enabled and use a shard size of 15 with 8 concurrent nodes, use the following command and options:

```
yarn start --sharding --shardSize 15 --maxConcurrency 8 --monitor
```

## Flags

| Flag            | Type           | Default | Description                                                                                                |
|-----------------|----------------|---------|------------------------------------------------------------------------------------------------------------|
| headless        | `boolean`      | `false` | Enable headless mode for all Chromium instances.                                                           |
| sharding        | `true`/`false` | `false` | Enable sharding for faster scraping.                                                                       |
| maxConcurrent   | `integer`      | `5`     | Set # of concurrent scraping nodes.                                                                        |
| shardSize       | `integer`      | `15`    | Set shard size for each scraping node. If sharding is disabled, scrapes the first x schools from the list. |
| block-resources | `boolean`      | `false` | Enable resource blocking for faster network loads, speeding up scraping.                                   |
| monitor         | `boolean`      | `false` | Enable progress bars for scraping.                                                                         |
| verbose         | `boolean`      | `false` | Enable verbose logging output. Use with monitor disabled.                                                  |

## Known issues
### Persistent firewall permissions popup on macOS

This occurs because the chromium package that's used by puppeteer is not signed, a popup is shown to the user to notify them about it.
The solution is to sign the package yourself, which can be done with the command below.

Run the following command, where "mac-version" is replaced with the version of chromium downloaded.

```
sudo codesign --force --deep --sign - ./node_modules/puppeteer/.local-chromium/mac-version/chrome-mac/Chromium.app
```
