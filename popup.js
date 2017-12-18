function getStatus(callback) {
    chrome.storage.sync.get(['adBlock', 'banner'], function (items) {
        if (chrome.runtime.lastError) console.log(chrome.runtime.lastError);
        var status = {
            adBlock: items.adBlock || typeof items.adBlock === 'undefined',
            banner: items.banner || typeof items.banner === 'undefined'
        };
        if (callback) callback(status);
    });
}

function setStatus(field, status, callback) {
    chrome.storage.sync.set({ [field]: status }, function () {
        console.log(field + ' status set to ' + status);
        if (callback) callback();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    var redeemBtn = document.getElementById('redeem-btn');
    var blockOnBtn = document.getElementById('block-on-btn');
    var blockOffBtn = document.getElementById('block-off-btn');
    var bannerOnBtn = document.getElementById('banner-on-btn');
    var bannerOffBtn = document.getElementById('banner-off-btn');
    var settingsBtn = document.getElementById('settings-btn');
    var logoutBtn = document.getElementById('logout-btn');

    var opt0Btn = document.getElementById('option0-btn');
    var opt1Btn = document.getElementById('option1-btn');
    var opt2Btn = document.getElementById('option2-btn');

    getStatus(function (status) {
        if (status.adBlock) {
            blockOffBtn.style.display = 'block';
        } else {
            blockOnBtn.style.display = 'block';
        }
        if (status.banner) {
            bannerOffBtn.style.display = 'block';
        } else {
            bannerOnBtn.style.display = 'block';
        }
    });

    blockOnBtn.addEventListener('click', function () {
        blockOnBtn.style.display = 'none';
        blockOffBtn.style.display = 'block';
        chrome.runtime.sendMessage({ trigger: 0, statusChange: 2 }, function () {
            setStatus('adBlock', true);
        });
    });

    blockOffBtn.addEventListener('click', function () {
        blockOffBtn.style.display = 'none';
        blockOnBtn.style.display = 'block';
        chrome.runtime.sendMessage({ trigger: 0, statusChange: -2 }, function () {
            setStatus('adBlock', false);
        });
    });

    bannerOnBtn.addEventListener('click', function () {
        bannerOnBtn.style.display = 'none';
        bannerOffBtn.style.display = 'block';
        chrome.runtime.sendMessage({ trigger: 0, statusChange: 1 }, function () {
            setStatus('banner', true);
        });
    });

    bannerOffBtn.addEventListener('click', function () {
        bannerOffBtn.style.display = 'none';
        bannerOnBtn.style.display = 'block';
        chrome.runtime.sendMessage({ trigger: 0, statusChange: -1 }, function () {
            setStatus('banner', false);
        });
    });

    opt0Btn.addEventListener('click', function () {
        chrome.storage.sync.set({ displayOption: 0 }, function () {
            console.log('Display option set to 0');
        });
    });
    opt1Btn.addEventListener('click', function () {
        chrome.storage.sync.set({ displayOption: 1 }, function () {
            console.log('Display option set to 1');
        });
    });
    opt2Btn.addEventListener('click', function () {
        chrome.storage.sync.set({ displayOption: 2 }, function () {
            console.log('Display option set to 2');
        });
    });
});

// function changeBackgroundColor(color) {
//     var script = 'document.body.style.backgroundColor="' + color + '";';
//     chrome.tabs.executeScript({ code: script });
// }

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
