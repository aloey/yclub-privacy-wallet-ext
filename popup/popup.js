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

function setStatus(status, callback) {
    chrome.storage.sync.set(status, function () {
        var keys = Object.keys(status);
        for (var i = 0; i < keys.length; i++) {
            console.log(keys[i] + ' status set to ' + status[keys[i]]);
        }
        if (callback) callback();
    });
}

function adBlocker() {
    var blockOnBtn = document.getElementById('block-on-btn');
    var blockOffBtn = document.getElementById('block-off-btn');
    var status;
    var statusChange;
    if (this.id === blockOnBtn.id) {
        status = true;
        blockOnBtn.style.display = 'none';
        blockOffBtn.style.display = 'block';
        statusChange = 2;
    } else if (this.id === blockOffBtn.id) {
        status = false;
        blockOffBtn.style.display = 'none';
        blockOnBtn.style.display = 'block';
        statusChange = -2;
    }
    chrome.runtime.sendMessage({ trigger: 0, statusChange: statusChange }, function () {
        setStatus({ adBlock: status });
    });
}

function banner() {
    var bannerOnBtn = document.getElementById('banner-on-btn');
    var bannerOffBtn = document.getElementById('banner-off-btn');
    var status;
    var statusChange;
    if (this.id === bannerOnBtn.id) {
        status = true;
        bannerOnBtn.style.display = 'none';
        bannerOffBtn.style.display = 'block';
        statusChange = 1;
    } else if (this.id === bannerOffBtn.id) {
        status = false;
        bannerOffBtn.style.display = 'none';
        bannerOnBtn.style.display = 'block';
        statusChange = -1;
    }
    chrome.runtime.sendMessage({ trigger: 0, statusChange: statusChange }, function () {
        setStatus({ banner: status });
    });
}

function clearErrors() {
    var email = document.getElementById('email');
    var password = document.getElementById('password');
    var emErr = document.getElementById('email-error');
    var pwErr = document.getElementById('password-error');
    if (emErr) email.parentNode.removeChild(emErr);
    if (pwErr) password.parentNode.removeChild(pwErr);
}

function login() {
    var email = document.getElementById('email');
    email.value = '';
    document.getElementById('password').value = '';
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('register-option').style.display = 'none';
    document.getElementById('main-btn').style.display = 'block';
    document.getElementById('login-option').style.display = 'block';
    clearErrors();
    email.focus();
}

function authOnEnter(keypress) {
    if (keypress.keyCode === 13) {
        document.getElementById('auth-btn').click();
    }
}

function backToMain() {
    document.getElementById('login-btn').style.display = 'block';
    document.getElementById('register-option').style.display = 'block';
    document.getElementById('main-btn').style.display = 'none';
    document.getElementById('login-option').style.display = 'none';
}

function authenticate() {
    var email = document.getElementById('email');
    var password = document.getElementById('password');
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            var response = JSON.parse(this.responseText);
            if (response.access_token) {
                console.log('Login successful');
                authenticated(response.access_token);
            } else {
                console.log('Login failed');
                var errorMsg = response.message;
                if (errorMsg.includes('username') || !email.value) {
                    var error = document.createElement('div');
                    error.innerText = '* Invalid email';
                    error.id = 'email-error';
                    error.classList.add('error');
                    email.parentNode.appendChild(error);
                }
                if (errorMsg.includes('password') || !password.value) {
                    var error = document.createElement('div');
                    error.innerText = '* Invalid password';
                    error.id = 'password-error';
                    error.classList.add('error');
                    password.parentNode.appendChild(error);
                }
            }
        }
    };
    xhttp.open("POST", 'http://yclub-privacywallet-api-dev.us-west-2.elasticbeanstalk.com/auth/login', true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send('username=' + (email.value || 'none') + '&password=' + (password.value || 'none') + '&grant_type=password&client_id=null&client_secret=null');
    clearErrors();
}

function authenticated(token, option) {
    document.getElementById('login-option').style.display = 'none';
    document.getElementById('main-btn').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('banner-option').style.display = 'block';
    document.getElementById('profile-option').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'block';
    if (option && option.displayOnly) return;
    setStatus({ auth: true, token: token });
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
        setStatus({ auth: false, token: null });
    }
}

function openRegistration() {
    chrome.tabs.create({ url: '../pages/registration/registration.html' })
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('popup opened');
    var blockOnBtn = document.getElementById('block-on-btn');
    var blockOffBtn = document.getElementById('block-off-btn');
    var bannerOnBtn = document.getElementById('banner-on-btn');
    var bannerOffBtn = document.getElementById('banner-off-btn');
    var logoutBtn = document.getElementById('logout-btn');
    var loginBtn = document.getElementById('login-btn');
    var mainBtn = document.getElementById('main-btn');
    var authBtn = document.getElementById('auth-btn');
    var email = document.getElementById('email');
    var password = document.getElementById('password');
    var registerBtn = document.getElementById('register-btn');
    var signupBtn = document.getElementById('signup-btn');

    var redeemBtn = document.getElementById('redeem-btn');
    var settingsBtn = document.getElementById('settings-btn');
    var opt0Btn = document.getElementById('option0-btn');
    var opt1Btn = document.getElementById('option1-btn');
    var opt2Btn = document.getElementById('option2-btn');

    getStatus(function (status) {
        if (status.auth) {
            authenticated(null, { displayOnly: true })
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

    chrome.runtime.sendMessage({ trigger: 1 }, function (blockCounts) {
        document.getElementById('page-ads').innerHTML = blockCounts.page;
        document.getElementById('day-ads').innerHTML = blockCounts.day;
    });

    authBtn.addEventListener('click', authenticate);
    loginBtn.addEventListener('click', login);
    logoutBtn.addEventListener('click', logout);
    mainBtn.addEventListener('click', backToMain);
    blockOnBtn.addEventListener('click', adBlocker);
    blockOffBtn.addEventListener('click', adBlocker);
    bannerOnBtn.addEventListener('click', banner);
    bannerOffBtn.addEventListener('click', banner);
    registerBtn.addEventListener('click', openRegistration);
    signupBtn.addEventListener('click', openRegistration);
    password.addEventListener('keypress', authOnEnter);
    email.addEventListener('keypress', authOnEnter);
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
