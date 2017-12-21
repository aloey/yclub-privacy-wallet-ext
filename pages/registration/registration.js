function clearErrors() {
    var emErr = document.getElementById('email-error');
    var pwErr = document.getElementById('password-error');
    var pwcErr = document.getElementById('password-conf-error');
    if (emErr) document.getElementById('email').parentNode.removeChild(emErr);
    if (pwErr) document.getElementById('password').parentNode.removeChild(pwErr);
    if (pwcErr) document.getElementById('password-conf').parentNode.removeChild(pwcErr);
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

function register() {
    var form = {
        email: document.getElementById('email'),
        password: document.getElementById('password'),
        passwordConf: document.getElementById('password-conf')
    };
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            var response = JSON.parse(this.responseText);
            if (response.success) {
                console.log('Registration successful');
                alert('Registration successful');
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    var tab = tabs[0];
                    chrome.tabs.remove(tab.id);
                });
            } else {
                console.log('Registration failed');
                if (response.error === 'duplicate_key') {
                    var error = document.createElement('div');
                    error.innerText = '* This email address is already registered';
                    error.id = 'email-error';
                    error.classList.add('error');
                    form.email.parentNode.appendChild(error);
                } else if (response.error === 'not_email') {
                    var error = document.createElement('div');
                    error.innerText = '* Must be a valid email address';
                    error.id = 'email-error';
                    error.classList.add('error');
                    form.email.parentNode.appendChild(error);
                } else if (response.error === 'different_pwds') {
                    var error = document.createElement('div');
                    error.innerText = '* Password does not match the confirm password';
                    error.id = 'password-conf-error';
                    error.classList.add('error');
                    form.passwordConf.parentNode.appendChild(error);
                } else if (response.error === 'missing_params') {
                    var missing = response.message.match(/'(.*?)'/ig, );
                    for (var i = 0; i < missing.length; i++) {
                        var missingFieldId = missing[i].replace(/'/g, '');
                        var missingField = form[missingFieldId];
                        var error = document.createElement('div');
                        error.innerText = '* Required';
                        error.id = missingField.id + '-error';
                        error.classList.add('error');
                        missingField.parentNode.appendChild(error);
                    }
                }
            }
        }
    };
    xhttp.open("POST", 'http://yclub-privacywallet-api-dev.us-west-2.elasticbeanstalk.com/auth/register', true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send('email=' + form.email.value + '&password=' + form.password.value + '&passwordConf=' + form.passwordConf.value);
    clearErrors();
}

function authOnEnter(keypress) {
    if (keypress.keyCode === 13) {
        document.getElementById('register-btn').click();
    }
}
document.addEventListener('DOMContentLoaded', function () {
    var email = document.getElementById('email');
    var password = document.getElementById('password');
    var passwordConf = document.getElementById('password-conf');
    var registerBtn = document.getElementById('register-btn');

    email.addEventListener('keypress', authOnEnter);
    password.addEventListener('keypress', authOnEnter);
    passwordConf.addEventListener('keypress', authOnEnter);
    registerBtn.addEventListener('click', register);

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
