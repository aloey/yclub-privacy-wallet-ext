
function getCurrentTabUrl(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function (tabs) {
        var tab = tabs[0];
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        var url = tab.url;
        console.assert(typeof url == 'string', 'tab.url should be a string');
        callback(url);
    });
}

function changeBackgroundColor(color) {
    var script = 'document.body.style.backgroundColor="' + color + '";';
    chrome.tabs.executeScript({ code: script });
}

function getActivationStatus(callback) {
    chrome.storage.sync.get('status', function (items) {
        console.log('Current status: ' + items.status);
        if (callback) callback(chrome.runtime.lastError ? null : items.status);
    });
}

function setActivationStatus(status, callback) {
    chrome.storage.sync.set({ status: status }, function () {
        console.log('Extension status set to ' + status);
        if (callback) callback();
    });
}

function setIcon(status, callback) {
    var icon = (status)
        ? {
            "16": "images/pw16.png",
            "24": "images/pw24.png",
            "32": "images/pw32.png",
            "64": "images/pw64.png",
            "128": "images/pw128.png"
        }
        : {
            "16": "images/pwoff16.png",
            "24": "images/pwoff24.png",
            "32": "images/pwoff32.png",
            "64": "images/pwoff64.png",
            "128": "images/pwoff128.png"
        };
    chrome.browserAction.setIcon({ path: icon }, function () {
        if (callback) callback();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    var redeemButton = document.getElementById('redeem-btn');
    var activateButton = document.getElementById('activate-btn');
    var pauseButton = document.getElementById('pause-btn');
    var settingsButton = document.getElementById('settings-btn');
    var logoutButton = document.getElementById('logout-btn');

    var opt0Btn = document.getElementById('option0-btn');
    var opt1Btn = document.getElementById('option1-btn');
    var opt2Btn = document.getElementById('option2-btn');

    getActivationStatus(function (lastStatus) {
        if (typeof lastStatus === 'undefined' || lastStatus) {
            setIcon(true, function () {
                pauseButton.style.display = 'inline';
            });
        } else {
            setIcon(false, function () {
                activateButton.style.display = 'inline';
            });
        };
    });

    activateButton.addEventListener('click', function () {
        setActivationStatus(true, function () {
            setIcon(true, function () {
                activateButton.style.display = 'none';
                pauseButton.style.display = 'inline';
            });

        });
    });

    pauseButton.addEventListener('click', function () {
        setActivationStatus(false, function () {
            setIcon(false, function () {
                pauseButton.style.display = 'none';
                activateButton.style.display = 'inline';
            });
        });
    });

    opt0Btn.addEventListener('click', function(){
        chrome.storage.sync.set({ displayOption: 0 }, function () {
            console.log('Display option set to 0');
        });
    });
    opt1Btn.addEventListener('click', function(){
        chrome.storage.sync.set({ displayOption: 1 }, function () {
            console.log('Display option set to 1');
        });
    });
    opt2Btn.addEventListener('click', function(){
        chrome.storage.sync.set({ displayOption: 2 }, function () {
            console.log('Display option set to 2');
        });
    });
});
