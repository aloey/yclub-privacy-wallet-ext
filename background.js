var statusId = 3;

var icons = {
    3: {
        16: 'images/pw16.png',
        24: 'images/pw24.png',
        32: 'images/pw32.png',
        64: 'images/pw64.png',
        128: 'images/pw128.png'
    },
    1: {
        16: 'images/pwna16.png',
        24: 'images/pwna24.png',
        32: 'images/pwna32.png',
        64: 'images/pwna64.png',
        128: 'images/pwna128.png'
    },
    2: {

        16: 'images/pwnb16.png',
        24: 'images/pwnb24.png',
        32: 'images/pwnb32.png',
        64: 'images/pwnb64.png',
        128: 'images/pwnb128.png'
    },
    0: {
        16: 'images/pwoff16.png',
        24: 'images/pwoff24.png',
        32: 'images/pwoff32.png',
        64: 'images/pwoff64.png',
        128: 'images/pwoff128.png'
    }
};

function setIcon(statusId, callback) {
    var icon = icons[statusId];
    chrome.browserAction.setIcon({ path: icon }, function () {
        console.log('New browser action icon set');
        if (callback) callback();
    });
}

function getStatus(callback) {
    chrome.storage.sync.get(['auth', 'adBlock', 'banner'], function (items) {
        if (chrome.runtime.lastError) console.log(chrome.runtime.lastError);
        var status = {
            auth: items.auth,
            adBlock: items.adBlock || typeof items.adBlock === 'undefined',
            banner: items.banner || typeof items.banner === 'undefined'
        };
        if (callback) callback(status);
    });
}

function initialize() {
    getStatus(function (status) {
        var adBlock = status.adBlock;
        if (adBlock) {
            chrome.webRequest.onBeforeRequest.addListener(blockWebRequest, { urls: blacklist }, ["blocking"]);
        }
        console.log('Ad blocker: ' + ((adBlock) ? 'ON' : 'OFF'));
        statusId = (adBlock ? 2 : 0) + (status.banner && status.auth ? 1 : 0);
        console.log('Status ID: ' + statusId);
        setIcon(statusId);
    });
}

function blockWebRequest(details) {
    console.log("blocking:", details.url);
    return { cancel: true };
}

// Url tracking listener
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.trigger === 0) {
            statusId += request.statusChange;
            console.log('New status ID: ' + statusId);
            setIcon(statusId, sendResponse);
            return true;
        }
        if (request.trigger === "currentUrl") {
            console.log(request.currentUrl)
        }
    }
);

// Ad blocking listener
chrome.storage.onChanged.addListener(function (changes, areaName) {
    var auth = changes.auth;
    var adBlock = changes.adBlock;
    if (auth) {
        initialize();
    }
    if (adBlock) {
        if (adBlock.newValue) {
            chrome.webRequest.onBeforeRequest.addListener(blockWebRequest, { urls: blacklist }, ["blocking"]);
            console.log('Ad blocker: ON');
        } else {
            chrome.webRequest.onBeforeRequest.removeListener(blockWebRequest);
            console.log('Ad blocker: OFF');
        }
    }
});

// Initialize
initialize();


