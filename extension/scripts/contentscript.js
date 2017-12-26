// Get current url
// var url = window.location.href;

// Block ads
// var hosts = Object.keys(blockedSelectors);
// var numHosts = hosts.length;
// while (numHosts > 0) {
//     var host = blockedSelectors[hosts[numHosts - 1]];
//     if (url.includes(host.domain)) {
//         var selectors = host.selectors;
//         var numSelectors = selectors.length;
//         while (numSelectors > 0) {
//             $(selectors[numSelectors - 1]).each(function (index, elem) {
//                 $(elem).css('display', 'none');
//                 console.log('[' + index + "] Blocking: " + $(elem).attr('id'));
//             });
//             numSelectors -= 1;
//         }
//     }
//     numHosts -= 1;
// }

// Advert
var bannerStatus = true;
var width = 300;
var height = 120;
var mouseover = false;
var hideJob;
var displayOption = 0;

function moveAdvert(option) {
    var advert = $('#pw-note');
    advert.css('transition', '');
    if (!option || option === 0) {
        advert.css('top', '');
        advert.css('bottom', -(height + 10) + 'px');
        advert.css('left', '');
        advert.css('right', '10px');
        advert.data('direction', 'bottom');
        advert.data('offset-show', 0);
        advert.data('offset-hide', -(height + 10));
    } else if (option === 1) {
        advert.css('top', '0px');
        advert.css('bottom', '');
        advert.css('left', -(width + 10) + 'px');
        advert.css('right', '');
        advert.data('direction', 'left');
        advert.data('offset-show', 10);
        advert.data('offset-hide', -(width + 10));
    } else if (option === 2) {
        advert.css('top', '0px');
        advert.css('bottom', '');
        advert.css('left', '');
        advert.css('right', -(width + 10) + 'px');
        advert.data('direction', 'right');
        advert.data('offset-show', 10);
        advert.data('offset-hide', -(width + 10));
    }
    console.log('Advert repositioned');
}

function getStatus(callback) {
    chrome.storage.sync.get(['auth', 'banner', 'displayOption'], function (items) {
        if (chrome.runtime.lastError) console.log(chrome.runtime.lastError);
        var banner = {
            status: items.auth && (items.banner || typeof items.banner === 'undefined'),
            displayOption: items.displayOption || 0
        };
        if (callback) callback(banner);
    });
}

function showAdvert() {
    if (bannerStatus) {
        moveAdvert(displayOption);
        setTimeout(function () {
            var advert = $('#pw-note');
            console.log('Displaying advert (' + displayOption + ')');
            var direction = advert.data('direction');
            var offset = advert.data('offset-show');
            advert.css('transition', '0.5s');
            advert.css(direction, offset + "px");
            hideAdvert(2500);
        }, 500);
    }
}

function hideAdvert(timeout) {
    if (hideJob) clearTimeout(hideJob);
    hideJob = setTimeout(function () {
        var advert = $('#pw-note');
        var direction = advert.data('direction');
        var offset = advert.data('offset-hide');
        if (!mouseover) {
            console.log('Hiding advert');
            advert.css(direction, offset + "px");
        }
    }, timeout || 2000);
};

function createAdvert() {
    var advert = $(document.createElement('div'));
    advert.attr('id', 'pw-note');
    advert.css('width', width + 'px');
    advert.css('height', height + 'px');
    advert.css('left', -width + 'px');
    advert.css('bottom', -height + 'px');
    advert.css('background', '#FFFFFF');
    advert.css('position', 'fixed');
    advert.css('border-radius', '5px');
    advert.css('border', '1px solid #767B91');
    advert.css('box-shadow', '0px 25px 10px -15px rgba(0, 0, 0, 0.05)');
    advert.css('cursor', 'pointer');
    advert.css('z-index', 9007199254740991);
    advert.mouseover(function () { mouseover = true; });
    advert.mouseout(function () {
        mouseover = false;
        hideAdvert(1000);
    });

    var img = $(document.createElement('img'));
    img.attr('src', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx5jpMvWXzxOrWVJMe2Z8LEbTYUuZug8Ow4dwNKXsr9efsphS6');
    img.css('border-radius', '50%');
    img.css('position', 'absolute');
    img.css('top', '10px');
    img.css('left', '10px');
    img.css('width', '50px');
    img.css('height', '50px');
    advert.append(img);

    var title = $(document.createElement('div'));
    title.text('Shiba Inu says, 140 characters');
    title.css('position', 'absolute');
    title.css('top', '10px');
    title.css('left', '75px');
    title.css('font-size', '14px');
    title.css('font-weight', 'bold');
    advert.append(title);

    var msg = $(document.createElement('div'));
    msg.text('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec scelerisque nulla ac lacus aliquet, volutpat dapibus magna vulputate posuere.');
    msg.css('position', 'absolute');
    msg.css('top', '30px');
    msg.css('left', '75px');
    msg.css('font-size', '14px');
    advert.append(msg);

    $(document.body).append(advert);
}

// Banner status listener
chrome.storage.onChanged.addListener(function (changes, areaName) {
    var banner = changes.banner;
    var dispOpt = changes.displayOption;
    if (banner) {
        if (banner.newValue) {
            bannerStatus = true;
            console.log('Banner: ON (' + displayOption + ')');
            showAdvert(advertDiv);
        } else {
            bannerStatus = false;
            console.log('Banner: OFF');
        }
    }
    if (dispOpt) {
        displayOption = dispOpt.displayOption;
        console.log('Display option changed to: ' + displayOption);
        showAdvert(advertDiv);
    }
});

createAdvert();
getStatus(function (banner) {
    bannerStatus = banner.status;
    displayOption = banner.displayOption;
    console.log('Banner: ' + ((bannerStatus) ? 'ON (' + displayOption + ')' : 'OFF'));
    showAdvert();
});


// Tracked URL message
// console.log(url);
// chrome.runtime.sendMessage({ "trigger": "currentUrl", "currentUrl": url });