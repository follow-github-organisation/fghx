// window.onload = function () {
const host = 'https://api.followgithub.org/v1';

// decide the help text visibility on the basis of token value and following count
chrome.storage.sync.get(function(storage_result) {
    // remove editable access for user_license field
    if (storage_result.user_license !== undefined) {
        const checkExist = setInterval(function() {
            const userLicenseElement = document.getElementById('user_license');
            if (userLicenseElement !== null) {
                // remove editable access for user_license field
                document.getElementById('user_license').disabled = true;
                document.getElementById('user_license').placeholder = storage_result.user_license;
                document.getElementById('user_license').value = storage_result.user_license;

                clearInterval(checkExist);
            }
        }, 500);
    }

    // remove editable access for user_token field
    if (storage_result.user_token !== undefined) {
        const checkExist = setInterval(function() {
            const userTokenElement = document.getElementById('user_token');
            if (userTokenElement !== null) {
                // remove editable access for user_license field
                document.getElementById('user_token').disabled = true;
                document.getElementById('user_token').placeholder = storage_result.user_token;
                document.getElementById('user_token').value = storage_result.user_token;

                // enable loader
                document.getElementById("form-loader").style.display = 'none';

                clearInterval(checkExist);
            }
        }, 500);
    }

    // if license is present
    if (storage_result.user_license !== undefined) {
        // show the supporter help text
        document.getElementById("supporter-help-text").style.display = "block";

        // add sentence to show
        document.querySelector('#supporter-help-text > p').textContent = "You have followed " + storage_result.following_count + " organizations. Thank you for being a supporter.";

        // hide other help text
        document.getElementById("initial-help-text").style.display = "none";
        document.getElementById("activation-help-text").style.display = "none";
        document.getElementById("adopter-help-text").style.display = "none";
        document.getElementById("pre-supporter-help-text").style.display = "none";

        // hide the buy license promotion
        document.getElementById("buy-license-container").style.display = "none";
    } else {
        /* license is not present */

        // if token is not present
        if (storage_result.user_token === undefined) {
            // show the initial help text
            document.getElementById("initial-help-text").style.display = "block";

            // hide other help text
            document.getElementById("activation-help-text").style.display = "none";
            document.getElementById("adopter-help-text").style.display = "none";
            document.getElementById("pre-supporter-help-text").style.display = "none";
            document.getElementById("supporter-help-text").style.display = "none";
        } else {
            // remove editable access for user_token field
            document.getElementById('user_token').disabled = true;
            document.getElementById('user_token').placeholder = storage_result.user_token;
            document.getElementById('user_token').value = storage_result.user_token;

            // if there are no organizations followed
            if (storage_result.following_count === undefined) {
                // show the activation help text
                document.getElementById("activation-help-text").style.display = "block";

                // hide other help text
                document.getElementById("initial-help-text").style.display = "none";
                document.getElementById("adopter-help-text").style.display = "none";
                document.getElementById("pre-supporter-help-text").style.display = "none";
                document.getElementById("supporter-help-text").style.display = "none";
            } else if (storage_result.following_count < 10) {
                // show the adopter help text
                document.getElementById("adopter-help-text").style.display = "block";

                // add sentence to show
                document.querySelector('#adopter-help-text > p').textContent = "You have followed " + storage_result.following_count + " out of 10 free organizations";

                // add progress to show
                document.querySelector('#adopter-help-text > progress').setAttribute('value', storage_result.following_count);

                // hide other help text
                document.getElementById("initial-help-text").style.display = "none";
                document.getElementById("activation-help-text").style.display = "none";
                document.getElementById("pre-supporter-help-text").style.display = "none";
                document.getElementById("supporter-help-text").style.display = "none";
            } else if (storage_result.following_count === 10) {
                // show the adopter help text
                document.getElementById("pre-supporter-help-text").style.display = "block";

                // hide other help text
                document.getElementById("initial-help-text").style.display = "none";
                document.getElementById("activation-help-text").style.display = "none";
                document.getElementById("adopter-help-text").style.display = "none";
                document.getElementById("supporter-help-text").style.display = "none";
            } else if (storage_result.following_count > 10) {
                // show the supporter help text
                document.getElementById("supporter-help-text").style.display = "block";

                // add sentence to show
                document.querySelector('#supporter-help-text > p').textContent = "Hey Supporter! You have followed " + storage_result.following_count + " organizations. What's stopping you from 10 more?";

                // hide other help text
                document.getElementById("initial-help-text").style.display = "none";
                document.getElementById("activation-help-text").style.display = "none";
                document.getElementById("adopter-help-text").style.display = "none";
                document.getElementById("pre-supporter-help-text").style.display = "none";

                // hide the buy license promotion
                document.getElementById("buy-license-container").style.display = "none";
            }
        }
    }
});

// add the access token in storage if valid
function addUserToken(userToken) {
    // trim spaces if any from the token
    userToken = userToken.trim();

    console.log('add user token');
    // remove danger style from input if present before adding new value
    document.getElementById("user_token").classList.remove('uk-form-danger');

    // enable loader
    document.getElementById("form-loader").style.display = 'block';

    const url = host + "/user/token";

    let xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader('user_token', userToken);

    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // set the user access token to use
            chrome.storage.sync.set({"user_token":userToken}, function () {
                // add notification with the success response text
                parsedResponsePayload = JSON.parse(xhr.responseText);
                UIkit.notification('<span class="uk-padding-small uk-label uk-label-success" style="position:relative;left:0%">' + parsedResponsePayload.message + '</span>');

                // disable loader
                document.getElementById("form-loader").style.display = 'none';

                // reset the value of the user token input field
                document.getElementById("user_token").value = userToken;

                // show the activation help text
                document.getElementById("activation-help-text").style.display = "block";

                // hide other help text
                document.getElementById("initial-help-text").style.display = "none";
                document.getElementById("adopter-help-text").style.display = "none";
                document.getElementById("pre-supporter-help-text").style.display = "none";
                document.getElementById("supporter-help-text").style.display = "none";

                // remove editable access for user_token field
                document.getElementById('user_token').disabled = true;
                document.getElementById('user_token').placeholder = userToken;
                document.getElementById('user_token').value = userToken;
            });
        } else if (xhr.readyState === 4 && xhr.status === 403) {
            // add notification with the failure response text
            parsedResponsePayload = JSON.parse(xhr.responseText);
            UIkit.notification('<span class="uk-padding-small uk-label uk-label-success" style="position:relative;left:0%">' + parsedResponsePayload.message + '</span>');
        }
    };
    xhr.send();
}

// add the license key for a given user token in storage if valid
function addUserLicense(userToken, userLicense) {
    // trim spaces if any from the token
    userToken = userToken.trim();

    // trim spaces if any from license
    userLicense = userLicense.trim();

    // remove danger style from input if present before adding new value
    document.getElementById("user_license").classList.remove('uk-form-danger');

    // enable loader
    document.getElementById("form-loader").style.display = 'block';

    const url = host + "/user/license";

    let xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader('user_token', userToken);
    xhr.setRequestHeader('user_license', userLicense);

    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // set the user access token to use
            chrome.storage.sync.set({"user_license":userLicense}, function () {
                // collect following count
                chrome.storage.sync.get('following_count', function (following_count_result) {
                    // add notification with the success response text
                    parsedResponsePayload = JSON.parse(xhr.responseText);
                    UIkit.notification('<span class="uk-padding-small uk-label uk-label-success" style="position:relative;left:0%">' + parsedResponsePayload.message + '</span>');

                    // disable loader
                    document.getElementById("form-loader").style.display = 'none';

                    // show the supporter help text
                    document.getElementById("supporter-help-text").style.display = "block";

                    // add sentence to show
                    document.querySelector('#supporter-help-text > p').textContent = "You have followed " + following_count_result.following_count + " organizations";

                    // hide other help text
                    document.getElementById("initial-help-text").style.display = "none";
                    document.getElementById("activation-help-text").style.display = "none";
                    document.getElementById("adopter-help-text").style.display = "none";
                    document.getElementById("pre-supporter-help-text").style.display = "none";

                    // hide the buy license promotion
                    document.getElementById("buy-license-container").style.display = "none";


                    // reset the value of the user license input field
                    document.getElementById("user_license").value = userLicense;

                    // remove editable access for user_license field
                    document.getElementById('user_license').disabled = true;
                    document.getElementById('user_license').placeholder = userLicense;
                    document.getElementById('user_license').value = userLicense;
                });
            });
        } else if (xhr.readyState === 4 && xhr.status === 403) {
            // add notification with the failure response text
            parsedResponsePayload = JSON.parse(xhr.responseText);
            UIkit.notification('<span class="uk-padding-small uk-label uk-label-success" style="position:relative;left:0%">' + parsedResponsePayload.message + '</span>');
        }
    };
    xhr.send();
}
// };

document.addEventListener('DOMContentLoaded', function() {
    // reference to the form submit button
    const formSubmitButton = document.getElementById('form-submit-btn');

    // handle click on the form submit button
    formSubmitButton.addEventListener('click', function() {

        console.log('click on form submit');

        // check as per the value of stored token and license
        chrome.storage.sync.get(function (items) {
            // value of the user token input field
            const userTokenInput = document.getElementById("user_token").value;

            // value of the user license input field
            const userLicenseInput = document.getElementById("user_license").value;

            // value of the stored token
            const userTokenStorage = items.user_token;

            // if token is not stored, need to add it first, can not add license yet
            if (userTokenStorage === undefined) {
                // if the token input is empty
                if (userTokenInput === "") {
                    // add danger style on input field
                    document.getElementById("user_token").classList.add('uk-form-danger');
                } else {
                    // add the user token if it's valid
                    addUserToken(userTokenInput);
                }
            } else {
                // if user token is stored, user can add license now

                // if the license input is empty
                if (userLicenseInput === "") {
                    // add danger style on input field
                    document.getElementById("user_license").classList.add('uk-form-danger');
                } else {
                    // add the user license if it's valid
                    addUserLicense(userTokenStorage, userLicenseInput);
                }
            }
        });
    });
});
