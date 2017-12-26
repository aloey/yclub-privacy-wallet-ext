
function i18n() {
    var i18nElems = document.getElementsByClassName('i18n');
    var numElems = i18nElems.length;
    while (numElems) {
        var elem = i18nElems[numElems - 1];
        var match = elem.className.match(/i18n_([\S]*)/)[1];
        if (match) {
            var type = match.substring(match.lastIndexOf('_') + 1);
            if (type === 'button' || type === 'link') {
                elem.value = chrome.i18n.getMessage(match);
            } else if (type === 'ph') {
                elem.placeholder = chrome.i18n.getMessage(match);
            } else {
                elem.innerHTML = chrome.i18n.getMessage(match);
            }
        }
        numElems -= 1;
    }
}

function openRegistration() {
    chrome.tabs.create({ url: 'views/registration.html' })
}