
var statuses = {
    banner: true,
    adBlock: false,
    privacy: false,
    malware: false,
};
var activeTabId;
var blockCounts = {};
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
    chrome.storage.sync.get(['auth', 'adBlock', 'banner', 'totalAdBlocked', 'privacy', 'malware'], function (items) {
        if (chrome.runtime.lastError) console.log(chrome.runtime.lastError);
        statuses.banner = items.banner || typeof items.banner === 'undefined';
        statuses.adBlock = items.adBlock || typeof items.adBlock === 'undefined';
        statuses.privacy = items.privacy || typeof items.privacy === 'undefined';
        statuses.malware = items.malware || typeof items.malware === 'undefined';
        var status = {
            auth: items.auth,
            totalAdBlocked: items.totalAdBlocked || 0
        };
        if (callback) callback(status);
    });
}

function incrementTotalBlockCount(blocks) {
    if (typeof blockCounts.total === 'undefined') blockCounts.total = 0;
    blockCounts.total += blocks;
}

function syncBlockCounts() {
    chrome.storage.sync.set({ totalAdBlocked: blockCounts.total }, function () {
        console.log('Total block counts synced with storage');
    });
}

function initialize() {
    getStatus(function (status) {
        incrementTotalBlockCount(status.totalAdBlocked);
        getTabContext(null, function () {
            console.log('Ads blocked today: ' + blockCounts.total);
            if (statuses.adBlock) {
                chrome.webRequest.onBeforeRequest.addListener((blockWebRequest), { urls: ['<all_urls>'] }, ["blocking"]);
            }
            console.log('Ad blocker: ' + ((statuses.adBlock) ? 'ON' : 'OFF'));
            statusId = ((statuses.banner && status.auth) ? 1 : 0) + ((statuses.adBlock || statuses.privacy || statuses.malware) ? 2 : 0);
            console.log('Status ID: ' + statusId);
            setIcon(statusId);
        });
    });
}

function blockWebRequest(details) {
    var requestURL = details.url;
    var reqType = details.type;
    var tabId = details.tabId;
    var requestHostname = pm.URI.hostnameFromURI(requestURL);
    var tabContext;
    if (!blockCounts.hasOwnProperty(tabId)) {
        var rawURL = details.initiator;
        var normalURL = normalizePageURL(tabId, rawURL);
        var rootHostname = pm.URI.hostnameFromURI(normalURL);
        var rootDomain = pm.URI.domainFromHostname(rootHostname) || rootHostname;
        blockCounts[tabId] = {
            tabId: tabId,
            rawURL: rawURL,
            normalURL: normalURL,
            rootHostname: rootHostname,
            rootDomain: rootDomain,
            adBlockCount: 0
        };
    }
    tabContext = blockCounts[tabId];
    var context = {
        rootDomain: tabContext.rootDomain,
        rootHostname: tabContext.rootHostname,
        pageDomain: tabContext.rootDomain,
        pageHostname: tabContext.rootHostname,
        requestDomain: '',
        requestHostname: pm.URI.hostnameFromURI(requestURL),
        requestURL: details.url,
        requestType: details.type
    };

    var result = pm.staticNetFilteringEngine.matchString(context);
    // var url = pm.urlTokenizer.setURL(requestURL);
    // var pageHostnameRegister = pageHostname || '';
    // var requestHostnameRegister = requestHostname;

    if (result === 1) {
        blockCounts[tabId].adBlockCount += 1;
        incrementTotalBlockCount(1);
        console.log(`[Blocked] ${requestURL}`);
        return { cancel: true };
    }
    return;
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
            sendResponse({ page: blockCounts[activeTabId].adBlockCount || 0, total: blockCounts.total });
        }
        // if (request.trigger === "currentUrl") {
        //     console.log(request.currentUrl)
        // }
    }
);

var normalizePageURL = function (tabId, pageURL) {
    if (tabId.toString() === '-1') {
        return 'http://behind-the-scene/';
    }
    var uri = pm.URI.set(pageURL);
    var scheme = uri.scheme;
    if (scheme === 'https' || scheme === 'http') {
        return uri.normalizedURI();
    }

    var fakeHostname = scheme + '-scheme';

    if (uri.hostname !== '') {
        fakeHostname = uri.hostname + '.' + fakeHostname;
    } else if (scheme === 'about' && uri.path !== '') {
        fakeHostname = uri.path + '.' + fakeHostname;
    }

    return 'http://' + fakeHostname + '/';
};

// Page load listener
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading') {
        console.log('Page loading...');
        var rawURL = tab.url;
        var normalURL = normalizePageURL(tabId, rawURL);
        var rootHostname = pm.URI.hostnameFromURI(normalURL);
        var rootDomain = pm.URI.domainFromHostname(rootHostname) || rootHostname;
        getTabContext(tabId, function (tabContext) {
            tabContext.rawURL = rawURL;
            tabContext.normalURL = normalURL;
            tabContext.rootHostname = rootHostname;
            tabContext.rootDomain = rootDomain;
            tabContext.adBlockCount = 0;
        });
    } else if (changeInfo.status === 'complete') {
        console.log('Page complete');
        clearTimeout(syncOper);
        syncOper = setTimeout(syncBlockCounts, 10000);
    }
});

function getTabContext(tabId, callback) {
    if (!callback) callback = function () { };
    if (tabId === null) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var tab = tabs[0];
            if (!tab) return callback();
            var tabId = tab.id;
            if (!blockCounts[tabId]) {
                var rawURL = tab.url;
                var normalURL = normalizePageURL(tabId, rawURL);
                var rootHostname = pm.URI.hostnameFromURI(normalURL);
                var rootDomain = pm.URI.domainFromHostname(rootHostname) || rootHostname;
                blockCounts[tabId] = {
                    tabId: tabId,
                    rawURL: rawURL,
                    normalURL: normalURL,
                    rootHostname: rootHostname,
                    rootDomain: rootDomain,
                    adBlockCount: 0
                };
            }
            callback(blockCounts[tabId]);
        })
    } else {
        chrome.tabs.get(tabId, function (tab) {
            var tabId = tab.id;
            if (!blockCounts[tabId]) {
                var rawURL = tab.url;
                var normalURL = normalizePageURL(tabId, rawURL);
                var rootHostname = pm.URI.hostnameFromURI(normalURL);
                var rootDomain = pm.URI.domainFromHostname(rootHostname) || rootHostname;
                blockCounts[tabId] = {
                    tabId: tabId,
                    rawURL: rawURL,
                    normalURL: normalURL,
                    rootHostname: rootHostname,
                    rootDomain: rootDomain,
                    adBlockCount: 0
                };
            }
            callback(blockCounts[tabId]);
        });
    }
}

// Active tab listener
function onTabActivated(activeInfo) {
    console.log('### Active tab changed')
    activeTabId = activeInfo.tabId;
    // getTabContext(activeTabId)
};
chrome.tabs.onActivated.addListener(onTabActivated);

// Ad blocking listener
chrome.storage.onChanged.addListener(function (changes, areaName) {
    var auth = changes.auth;
    var adBlock = changes.adBlock;
    if (auth) { initialize(); }
    if (adBlock) {
        if (adBlock.newValue) {
            chrome.webRequest.onBeforeRequest.addListener((blockWebRequest), { urls: ['<all_urls>'] }, ["blocking"]);
            console.log('Ad blocker: ON');
        } else {
            chrome.webRequest.onBeforeRequest.removeListener(blockWebRequest);
            console.log('Ad blocker: OFF');
        }
    }
});

// Initialize
initialize();
