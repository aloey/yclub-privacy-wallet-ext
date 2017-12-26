
var statuses = {
    banner: true,
    adBlock: false,
    privacy: false,
    malware: false,
};
var currentTabId;
var blockCounts = { day: 0 };
var dateLastBlocked;
var syncOper;

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
    chrome.storage.sync.get(['auth', 'adBlock', 'banner', 'dayAdBlocked', 'dateLastBlocked', 'privacy', 'malware'], function (items) {
        if (chrome.runtime.lastError) console.log(chrome.runtime.lastError);
        statuses.banner = items.banner || typeof items.banner === 'undefined';
        statuses.adBlock = items.adBlock || typeof items.adBlock === 'undefined';
        statuses.privacy = items.privacy || typeof items.privacy === 'undefined';
        statuses.malware = items.malware || typeof items.malware === 'undefined';
        var status = {
            auth: items.auth,
            dayAdBlocked: items.dayAdBlocked || 0,
            dateLastBlocked: items.dateLastBlocked
        };
        if (callback) callback(status);
    });
}

function incrementDayBlockCount(lastDate, blocks) {
    var todayDate = new Date().getDate();
    if (!lastDate || lastDate !== todayDate) {
        blockCounts.day = 0;
        dateLastBlocked = todayDate;
        console.log('BEGINNING OF A NEW DAY');
    } else if (!dateLastBlocked) {
        dateLastBlocked = lastDate;
    }
    blockCounts.day += blocks;
}

function syncBlockCounts() {
    chrome.storage.sync.set({ dayAdBlocked: blockCounts.day, dateLastBlocked: dateLastBlocked }, function () {
        console.log('Day block counts synced with storage');
    });
}

function initialize() {
    getStatus(function (status) {
        var adBlock = statuses.adBlock;
        incrementDayBlockCount(status.dateLastBlocked, status.dayAdBlocked);
        console.log('Ads blocked today: ' + blockCounts.day);
        if (adBlock) {
            chrome.webRequest.onBeforeRequest.addListener((blockWebRequest), { urls: blacklist }, ["blocking"]);
        }
        console.log('Ad blocker: ' + ((adBlock) ? 'ON' : 'OFF'));
        statusId = ((statuses.banner && status.auth) ? 1 : 0) + ((statuses.adBlock || statuses.privacy || statuses.malware) ? 2 : 0);
        console.log('Status ID: ' + statusId);
        setIcon(statusId);
    });
}

function blockWebRequest(details) {
    var url = details.url;
    var reqType = details.type;
    var tabId = details.tabId;
    // var requestHostname = pwURI.hostnameFromURI(url);

    if (!blockCounts[tabId]) blockCounts[tabId] = 0;
    blockCounts[tabId] += 1;
    incrementDayBlockCount(dateLastBlocked, 1);
    console.log(`[Blocked] ${details.url}`);
    return { cancel: true };
}

/**
 * Message listener
 * 0: status change notification
 * 1: block count request
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.trigger === 0) {
            statuses[request.key] = request.value;
            statusId = (statuses.banner ? 1 : 0) + ((statuses.adBlock || statuses.privacy || statuses.malware) ? 2 : 0);
            console.log('New status ID: ' + statusId);
            setIcon(statusId, sendResponse);
            return true;
        } else if (request.trigger === 1) {
            sendResponse({ page: blockCounts[currentTabId] || 0, day: blockCounts.day });
        }
        // if (request.trigger === "currentUrl") {
        //     console.log(request.currentUrl)
        // }
    }
);

// Page load listener
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading') {
        console.log('Page loading...');
        blockCounts[tabId] = 0;
    } else if (changeInfo.status === 'complete') {
        console.log('Page complete');
        clearTimeout(syncOper);
        syncOper = setTimeout(syncBlockCounts, 10000);
    }
});

// Active tab listener
chrome.tabs.onActivated.addListener(function (activeInfo) {
    console.log('### Tab changed')
    currentTabId = activeInfo.tabId;
});

// Ad blocking listener
chrome.storage.onChanged.addListener(function (changes, areaName) {
    var auth = changes.auth;
    var adBlock = changes.adBlock;
    if (auth) { initialize(); }
    if (adBlock) {
        if (adBlock.newValue) {
            chrome.webRequest.onBeforeRequest.addListener((blockWebRequest), { urls: blacklist }, ["blocking"]);
            console.log('Ad blocker: ON');
        } else {
            chrome.webRequest.onBeforeRequest.removeListener(blockWebRequest);
            console.log('Ad blocker: OFF');
        }
    }
});

// Initialize
initialize();
