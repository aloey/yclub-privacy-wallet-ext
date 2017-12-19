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

function setStatus(field, status, callback) {
    chrome.storage.sync.set({ [field]: status }, function () {
        console.log(field + ' status set to ' + status);
        if (callback) callback();
    });
}

function adBlocker(status) {
    var blockOnBtn = document.getElementById('block-on-btn');
    var blockOffBtn = document.getElementById('block-off-btn');
    var statusChange;
    if (status) {
        blockOnBtn.style.display = 'none';
        blockOffBtn.style.display = 'block';
        statusChange = 2;
    } else {
        blockOffBtn.style.display = 'none';
        blockOnBtn.style.display = 'block';
        statusChange = -2;
    }
    chrome.runtime.sendMessage({ trigger: 0, statusChange: statusChange }, function () {
        setStatus('adBlock', status);
    });
}

function banner(status) {
    var bannerOnBtn = document.getElementById('banner-on-btn');
    var bannerOffBtn = document.getElementById('banner-off-btn');
    var statusChange;
    if (status) {
        bannerOnBtn.style.display = 'none';
        bannerOffBtn.style.display = 'block';
        statusChange = 1;
    } else {
        bannerOffBtn.style.display = 'none';
        bannerOnBtn.style.display = 'block';
        statusChange = -1;
    }
    chrome.runtime.sendMessage({ trigger: 0, statusChange: statusChange }, function () {
        setStatus('banner', status);
    });
}

function logout(option) {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('banner-option').style.display = 'none';
    document.getElementById('profile-option').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('main-btn').style.display = 'none';
    document.getElementById('login-option').style.display = 'none';
    document.getElementById('login-btn').style.display = 'block';
    document.getElementById('register-option').style.display = 'block';
    if (!option || !option.displayOnly) {
        setStatus('auth', false);
    }
}

function authenticate(option) {
    document.getElementById('login-option').style.display = 'none';
    document.getElementById('main-btn').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('banner-option').style.display = 'block';
    document.getElementById('profile-option').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'block';
    if (!option || !option.displayOnly) {
        setStatus('auth', true);
    }
}

function login() {
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('register-option').style.display = 'none';
    document.getElementById('main-btn').style.display = 'block';
    document.getElementById('login-option').style.display = 'block';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
}

document.addEventListener('DOMContentLoaded', function () {
    var redeemBtn = document.getElementById('redeem-btn');
    var blockOnBtn = document.getElementById('block-on-btn');
    var blockOffBtn = document.getElementById('block-off-btn');
    var bannerOnBtn = document.getElementById('banner-on-btn');
    var bannerOffBtn = document.getElementById('banner-off-btn');
    var settingsBtn = document.getElementById('settings-btn');
    var logoutBtn = document.getElementById('logout-btn');
    var loginBtn = document.getElementById('login-btn');
    var mainBtn = document.getElementById('main-btn');
    var authBtn = document.getElementById('auth-btn');
    var email = document.getElementById('email');
    var password = document.getElementById('password');

    var opt0Btn = document.getElementById('option0-btn');
    var opt1Btn = document.getElementById('option1-btn');
    var opt2Btn = document.getElementById('option2-btn');

    getStatus(function (status) {
        if (status.auth) {
            authenticate({ displayOnly: true })
        } else {
            logout({ displayOnly: true })
        }
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

    authBtn.addEventListener('click', function () {
        var email = document.getElementById('email');
        var password = document.getElementById('password');
        console.log('Email: ' + email.value);
        console.log('Password: ' + password.value);
        var emailOk = true;
        var pwOk = true;
        var emErr = document.getElementById('email-error');
        var pwErr = document.getElementById('password-error');
        if (emErr) email.parentNode.removeChild(emErr);
        if (pwErr) password.parentNode.removeChild(pwErr);
        if (email.value !== 'admin') {
            emailOk = false;
            var error = document.createElement('div');
            error.innerText = '* Invalid email';
            error.id = 'email-error';
            error.classList.add('font-red');
            error.style.width = '80%';
            error.style.textAlign = 'left';
            error.style.margin = 'auto';
            email.parentNode.appendChild(error);
        }
        if (password.value !== 'password') {
            pwOk = false;
            var error = document.createElement('div');
            error.innerText = '* Invalid password';
            error.id = 'password-error';
            error.classList.add('font-red');
            error.style.width = '80%'
            error.style.textAlign = 'left'
            error.style.margin = 'auto'
            password.parentNode.appendChild(error);
        }
        if (emailOk && pwOk) {
            authenticate();
        }
    });

    loginBtn.addEventListener('click', function () {
        login();
    });

    logoutBtn.addEventListener('click', function () {
        logout();
    });

    mainBtn.addEventListener('click', function () {
        logout({ displayOnly: true });
    });

    blockOnBtn.addEventListener('click', function () {
        adBlocker(true);
    });

    blockOffBtn.addEventListener('click', function () {
        adBlocker(false);
    });

    bannerOnBtn.addEventListener('click', function () {
        banner(true);
    });

    bannerOffBtn.addEventListener('click', function () {
        banner(false);
    });

    password.addEventListener('keypress', function (keypress) {
        console.log(keypress.keyCode);
        if (keypress.keyCode === 13) {
            authBtn.click();
        }
    })

    // opt0Btn.addEventListener('click', function () {
    //     chrome.storage.sync.set({ displayOption: 0 }, function () {
    //         console.log('Display option set to 0');
    //     });
    // });
    // opt1Btn.addEventListener('click', function () {
    //     chrome.storage.sync.set({ displayOption: 1 }, function () {
    //         console.log('Display option set to 1');
    //     });
    // });
    // opt2Btn.addEventListener('click', function () {
    //     chrome.storage.sync.set({ displayOption: 2 }, function () {
    //         console.log('Display option set to 2');
    //     });
    // });
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
