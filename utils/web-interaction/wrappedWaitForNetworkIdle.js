// Workaround for wrapping promises that need to wait for network activity
// that isn't a result of navigation to end before continuing.
//
// Slightly modified implementation based on this GitHub answer:
// https://github.com/puppeteer/puppeteer/issues/1278#issuecomment-638524079

async function wrappedWaitForNetworkIdle(page, promises) {

    waitForNetworkIdle = function (page, timeout, maxInflightRequests = 0) {
        page.on('request', onRequestStarted);
        page.on('requestfinished', onRequestFinished);
        page.on('requestfailed', onRequestFinished);

        let inflight = 0;
        let fulfill;
        let promise = new Promise(x => fulfill = x);
        let timeoutId = setTimeout(onTimeoutDone, timeout);
        return promise;

        function onTimeoutDone() {
            page.removeListener('request', onRequestStarted);
            page.removeListener('requestfinished', onRequestFinished);
            page.removeListener('requestfailed', onRequestFinished);
            fulfill();
        }

        function onRequestStarted() {
            ++inflight;
            if (inflight > maxInflightRequests)
                clearTimeout(timeoutId);
        }

        function onRequestFinished() {
            if (inflight === 0)
                return;
            --inflight;
            if (inflight === maxInflightRequests)
                timeoutId = setTimeout(onTimeoutDone, timeout);
        }
    }

    await Promise.all([
        promises,
        waitForNetworkIdle(page, 500, 0) // equivalent to 'networkidle0'
    ]);
}

module.exports = wrappedWaitForNetworkIdle
