// Get current url
var url = window.location.href;

// Block ads
var hosts = Object.keys(blockedSelectors);
var numHosts = hosts.length;
while (numHosts > 0) {
    var host = blockedSelectors[hosts[numHosts - 1]];
    if (url.includes(host.domain)) {
        var selectors = host.selectors;
        var numSelectors = selectors.length;
        while (numSelectors > 0) {
            $(selectors[numSelectors - 1]).each(function (index, elem) {
                $(elem).css('display', 'none');
                console.log('[' + index + "] Blocking: " + $(elem).attr('id'));
            });
            numSelectors -= 1;
        }
    }
    numHosts -= 1;
}

// Advert
var width = 300;
var height = 120;
var mouseover = false;
var hideJob;

function moveAdvert(advert, option) {
    $(advertDiv).css('transition', '');
    if (!option || option === 0) {
        $(advert).css('top', '');
        $(advert).css('bottom', -(height + 10) + 'px');
        $(advert).css('left', '');
        $(advert).css('right', '10px');
        $(advert).data('direction', 'bottom');
        $(advert).data('offset-show', 0);
        $(advert).data('offset-hide', -(height + 10));
    } else if (option === 1) {
        $(advert).css('top', '0px');
        $(advert).css('bottom', '');
        $(advert).css('left', -(width + 10) + 'px');
        $(advert).css('right', '');
        $(advert).data('direction', 'left');
        $(advert).data('offset-show', 10);
        $(advert).data('offset-hide', -(width + 10));
    } else if (option === 2) {
        $(advert).css('top', '0px');
        $(advert).css('bottom', '');
        $(advert).css('left', '');
        $(advert).css('right', -(width + 10) + 'px');
        $(advert).data('direction', 'right');
        $(advert).data('offset-show', 10);
        $(advert).data('offset-hide', -(width + 10));
    }
    console.log('Advert repositioned');
}

function getStatus(callback) {
    chrome.storage.sync.get(['status', 'displayOption'], function (items) {
        console.log('Current status: ' + items.status);
        if (callback) callback(chrome.runtime.lastError ? null : items);
    });
}

function showAdvert(advert) {
    getStatus(function (items) {
        var displayOption = items.displayOption;
        console.log('Current display option: ' + displayOption);
        moveAdvert(advert, displayOption);
        setTimeout(function () {
            console.log('Displaying advert');
            var direction = $(advert).data('direction');
            var offset = $(advert).data('offset-show');
            $(advertDiv).css('transition', '0.5s');
            $(advert).css(direction, offset + "px");
            hideAdvert(advert, 2500);
        }, 500);
    });
}

function hideAdvert(advert, timeout) {
    if(hideJob) clearTimeout(hideJob);
    hideJob = setTimeout(function () {
        var direction = $(advert).data('direction');
        var offset = $(advert).data('offset-hide');
        if (!mouseover) {
            console.log('Hiding advert');
            $(advert).css(direction, offset + "px");
        }
    }, timeout || 2000);
};

var advertDiv = document.createElement('div');
$(advertDiv).html('<div class="pw-note"></div>');
$(advertDiv).css('width', width + 'px');
$(advertDiv).css('height', height + 'px');
$(advertDiv).css('left', -width + 'px');
$(advertDiv).css('bottom', -height + 'px');
$(advertDiv).css('background', '#FFFFFF');
$(advertDiv).css('position', 'fixed');
$(advertDiv).css('border-radius', '5px');
$(advertDiv).css('border', '1px solid #767B91');
$(advertDiv).css('box-shadow', '0px 25px 10px -15px rgba(0, 0, 0, 0.05)');
$(advertDiv).css('cursor', 'pointer');
$(advertDiv).css('z-index', 9007199254740991);
$(advertDiv).mouseover(function () {
    mouseover = true;
});
$(advertDiv).mouseout(function () {
    mouseover = false;
    hideAdvert(advertDiv, 1000);
});

var img = document.createElement('img');
$(img).attr('src', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx5jpMvWXzxOrWVJMe2Z8LEbTYUuZug8Ow4dwNKXsr9efsphS6');
$(img).css('border-radius', '50%');
$(img).css('position', 'absolute');
$(img).css('top', '10px');
$(img).css('left', '10px');
$(img).css('width', '50px');
$(img).css('height', '50px');
$(advertDiv).append(img);

var title = document.createElement('div');
$(title).text('Shiba Inu says, 140 characters');
$(title).css('position', 'absolute');
$(title).css('top', '10px');
$(title).css('left', '75px');
$(title).css('font-size', '14px');
$(title).css('font-weight', 'bold');
$(advertDiv).append(title);

var msg = document.createElement('div');
$(msg).text('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec scelerisque nulla ac lacus aliquet, volutpat dapibus magna vulputate posuere.');
$(msg).css('position', 'absolute');
$(msg).css('top', '30px');
$(msg).css('left', '75px');
$(msg).css('font-size', '14px');
$(advertDiv).append(msg);

document.body.appendChild(advertDiv);

showAdvert(advertDiv);

chrome.storage.onChanged.addListener(function (changes, areaName) {
    showAdvert(advertDiv);
})


console.log(url);
chrome.runtime.sendMessage({ "trigger": "currentUrl", "currentUrl": url });