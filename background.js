// function getActivationStatus(callback) {
//     chrome.storage.sync.get('status', function (items) {
//         if (callback) callback(chrome.runtime.lastError ? null : items.status);
//     });
// }

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.trigger === "currentUrl") {
            console.log(request.currentUrl)
        }
    }
);

function blockWebRequest(details) {
    console.log("blocking:", details.url);
    return { cancel: true };
}

chrome.storage.onChanged.addListener(function (changes, areaName) {
    var status = changes.status;
    if (status && !status.newValue) {
        chrome.webRequest.onBeforeRequest.removeListener(blockWebRequest);
    } else {
        chrome.webRequest.onBeforeRequest.addListener(blockWebRequest, { urls: blacklist }, ["blocking"]);
    }
})

// 

// var redeemBtn = document.getElementById('redeem-btn');
// redeemBtn.addEventListener('click', () => {
//     var field = document.getElementsByClassName('share');
//     field.innerHTML = '__MSG_@@extension_id__';
// })

// var views = chrome.extension.getViews(/* { type: 'popup' } */);
// for (var i = 0; i < views.length; i++) {
//     console.log(views[i]);
    // const redeemBtn = views[i].document.getElementById('redeem-btn');
    // redeemBtn.addEventListener('click', () => { console.log('clicked'); });
// }

// document.addEventListener("DOMContentLoaded", function () {
//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//         // Note: this requires "activeTab" permission to access the URL
//         if (/* condition on tabs[0].url */) {
//             /* Adapt UI for condition 1 */
//         } else if (/* ... */) {
//             /* Adapt UI for condition 2 */
//         }
//     });
// });