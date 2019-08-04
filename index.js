// Flag to store if the current page is organization or not
let isOrgPage = true;

// Looking for a specifc nav element with class "orgnav"
// That's only available in organization pages
const orgnav = document.querySelector("nav.orgnav");

// chrome.storage.sync.clear(function () {
//     console.log('removed storage');
// });

// username for the organization
let org_username = '';

// Update the page status if the nav element is missing
if (orgnav === null) {
    isOrgPage = false;
    console.log('not org');
} else {
    org_username = document.querySelector("meta[property='profile:username']").getAttribute("content");
    console.log('org');
}

// Convert a timestamp to required format for the title
function getTimestampTitle(timestamp) {
    const date = new Date(timestamp * 1000).toString().split(" ");
    const hour = date[4].split(":")[0];
    const minute = date[4].split(":")[1];

    return date[2] + " " + date[1] + " " + date[3] + ", " + hour + ":" + minute + " " + date[5];
}

// Convert a timestamp to required format for the datetime
function getTimestampDatetime(timestamp) {
    return new Date(timestamp * 1000).toISOString().replace(".000", "");
}

const host = 'https://api.followgithub.org/v1';

// Add repository activities in the feed
function addActivities(activities) {
    // Pagination form as a reference element
    const moreFeedForm = document.querySelector('form[action*="/dashboard-feed"]');

    // Total activities in the feed, including a view "more" element
    const feedItemCount = moreFeedForm.parentElement.childElementCount;

    // Latest activity in context (as per timestamp)
    let activityCursor = activities.pop();

    // Iterate over the activities in order
    for (let j = 0; j <= feedItemCount - 2 + feedItemCount; j++) {
        // console.log('current items in activities', activities.length, activityCursor.activity_repo_name);
        // Feed item at the index
        const feedItem = moreFeedForm.parentElement.children[j];

        // Timestamp of the feed item at the index
        const feedItemTimestamp = Math.round(new Date(feedItem.querySelector('relative-time').getAttribute('datetime'))/1000);
        // console.log(feedItemTimestamp, feedItem.querySelector('.link-gray-dark.no-underline.text-bold.wb-break-all.d-inline-block').innerHTML);

        // Activity remaining to add in feed
        if (activities.length >= 0) {
            // console.log('cursor', activityCursor);
            if (activityCursor !== undefined && activityCursor.activity_fetched_at >= feedItemTimestamp) {
                // Create an element for the new feed activity item
                const newFeedItem = document.createElement('div');
                newFeedItem.classList.add('org_repo');

                // Prepare HTML string for the child structure (content) of new feed activity item
                const activityHTML = `
                        <div class="body">
                            <div class="d-flex flex-items-baseline border-bottom border-gray py-3">
                            <span class="mr-3"><a class="d-inline-block" href="` + activityCursor.org_username + `"><img class="avatar" src="https://avatars3.githubusercontent.com/u/` + activityCursor.org_github_id + `?s=64&amp;v=4" width="32" height="32" alt="` + "@" + activityCursor.org_username + `"></a></span>
                            <div class="d-flex flex-column width-full">
                                <div class="d-flex flex-items-baseline">
                                    <div>
                                        <a class="link-gray-dark no-underline text-bold wb-break-all d-inline-block" href="/` + activityCursor.org_username + `">` + activityCursor.org_username + `</a>

                                        created a
                                        repository
    
                                        <a class="link-gray-dark no-underline text-bold wb-break-all d-inline-block" href="/` + activityCursor.org_username + `/` + activityCursor.activity_repo_name + `">` + activityCursor.org_username + `/` + activityCursor.activity_repo_name + `</a>
                                        <span class="f6 text-gray-light no-wrap ml-1"><relative-time datetime="` + getTimestampDatetime(activityCursor.activity_fetched_at) + `" title="` + getTimestampTitle(activityCursor.activity_fetched_at) + `"></relative-time></span>
                                    </div>
                                </div>

                                <div class="Box p-3 mt-2">
                                    <div>
                                        <div class="f4 lh-condensed text-bold text-gray-dark">
                                            <a class="link-gray-dark no-underline text-bold wb-break-all d-inline-block" target="_blank" href="/` + activityCursor.org_username + `/` + activityCursor.activity_repo_name + `">` + activityCursor.org_username + `/` + activityCursor.activity_repo_name + `</a>

                                            <div class="float-right d-inline-block js-toggler-container starring-container ">
                                                <a class="btn btn-sm ml-2 mb-2 js-toggler-target" target="_blank" href="/` + activityCursor.org_username + `/` + activityCursor.activity_repo_name + `" value="View" aria-label="View this repository" title="View ` + activityCursor.org_username + `/` + activityCursor.activity_repo_name + `">
                                                    <svg class="octicon octicon-repo mr-1" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M4 9H3V8h1v1zm0-3H3v1h1V6zm0-2H3v1h1V4zm0-2H3v1h1V2zm8-1v12c0 .55-.45 1-1 1H6v2l-1.5-1.5L3 16v-2H1c-.55 0-1-.45-1-1V1c0-.55.45-1 1-1h10c.55 0 1 .45 1 1zm-1 10H1v2h2v-1h3v1h5v-2zm0-10H2v9h9V1z"></path></svg>
                                                    View
                                                </a>
                                            </div>
                                        </div>

                                        <div class="dashboard-break-word text-gray mt-1 repo-description">
                                            <p>` + activityCursor.activity_repo_description + `</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                `;

                // Add child content to the new feed activity element
                newFeedItem.insertAdjacentHTML('afterbegin', activityHTML);

                // Add new feed activity element before the current feed item in DOM
                feedItem.parentNode.insertBefore(newFeedItem, feedItem);

                // Update the cursor/index activity
                activityCursor = activities.pop();
            } else if (activityCursor === undefined) {
                // No activity remaining to add in feed
                break;
            }
        } else {
            // No activity remaining to add in feed
            break;
        }
    }
}

// Get repository activities from followed organizations
function getActivities(lastActivityTimestamp) {
    chrome.storage.sync.get("user_token", function (items) {
        // disallow feed activity collection if user_token is missing
        // TODO: Find if we can change the extension icon with red color (to show error)
        if (items.user_token === undefined) {
            console.log('not checking the feed');
            return;
        }

        // use the last-activity time to fetch feed if it's available
        const url = host + "/feed" + "?created_after=" + lastActivityTimestamp.toString();

        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader('user_token', items.user_token);

        xhr.onload = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                parsedResponsePayload = JSON.parse(xhr.responseText);
                addActivities(parsedResponsePayload.result);
            } else {
                console.log('Issue with getting the feed. Please report at https://github.com/follow-github-organisation');
            }
        };
        xhr.send();
    });
}

// Follow a requested organization
function followOrg() {
    chrome.storage.sync.get(function (items) {
        // do not follow if the organization is already followed
        if (items[org_username] === 'following') {
            return;
        }

        // Change the button text before starting to follow
        document.getElementById("fgh-follow-button").innerText = 'Following';
        // Disable the button
        document.getElementById('fgh-follow-button').classList.add('disabled');

        const url = host + "/organizations/following/" + org_username;

        let xhr = new XMLHttpRequest();
        xhr.open("PUT", url, true);
        xhr.setRequestHeader('user_token', items.user_token);

        xhr.onload = function () {
            console.log(xhr, 'response');
            if (xhr.readyState === 4 && xhr.status === 200) {
                // Save the following relation in storage
                chrome.storage.sync.set({[org_username]:"following"}, function() {});

                // Update organization following count
                if (items.following_count === undefined) {
                    // Set to 1 for the first organization followed
                    chrome.storage.sync.set({'following_count': 1}, function() {});
                } else {
                    // Increment if more than 1 organization followed
                    chrome.storage.sync.set({'following_count': items.following_count + 1}, function() {});
                }

                // Add tooltip to showcase the successful following operation
                document.getElementById('fgh-follow-button').setAttribute('aria-label', 'Super! You will get the activities in feed');
                document.getElementById('fgh-follow-button').classList.add('tooltipped');
                document.getElementById('fgh-follow-button').classList.add('tooltipped-s');
            } else if (xhr.readyState === 4 && xhr.status === 403) {
                // open the extension page and ask user to generate a valid token
                // chrome.tabs.create({ url: chrome.extension.getURL('newtab.html'), active: true });

                chrome.runtime.sendMessage({event: "open_extension_tab"}, function(response) {
                    console.log(response.status);
                });

                // Change the button text if the follow operation was not successful
                document.getElementById("fgh-follow-button").innerText = 'Follow';

                // Add tooltip to showcase the failing following operation
                document.getElementById('fgh-follow-button').setAttribute('aria-label', 'Some problem with the operation!');
                document.getElementById('fgh-follow-button').classList.add('tooltipped');
                document.getElementById('fgh-follow-button').classList.add('tooltipped-s');
                document.getElementById('fgh-follow-button').classList.remove('disabled');
            } else {
                // Change the button text if the follow operation was not successful
                document.getElementById("fgh-follow-button").innerText = 'Follow';

                // Add tooltip to showcase the failing following operation
                document.getElementById('fgh-follow-button').setAttribute('aria-label', 'Some problem with the operation!');
                document.getElementById('fgh-follow-button').classList.add('tooltipped');
                document.getElementById('fgh-follow-button').classList.add('tooltipped-s');
                document.getElementById('fgh-follow-button').classList.remove('disabled');
            }
        };
        xhr.send();
    });
}

// Update DOM content if it's an organization page
if (isOrgPage) {
    // follow button text (default: 'Follow')
    followButtonText = 'Follow';

    // Update text of the follow button as per the previous interactions
    chrome.storage.sync.get([org_username], function(items){
        followButtonText = items[org_username] === 'following' ? 'Following' : 'Follow';

        // Add a follow button in the main navigation if it's an organization page
        if (followButtonText === "Following") {
            navigationButtonHTML = '<a class="btn ml-3 float-right disabled tooltipped tooltipped-s" id="fgh-follow-button" aria-label="Super! You will get the activities in feed">' + followButtonText + '</a>';
        } else {
            navigationButtonHTML = '<a class="btn ml-3 float-right" id="fgh-follow-button">' + followButtonText + '</a>';
        }
        orgnav.insertAdjacentHTML('beforeend', navigationButtonHTML);

        // Add event listen to act when the follow button is clicked
        document.getElementById("fgh-follow-button").addEventListener("click", followOrg);
    });
} else {
    // Opening GitHub home page
    // TODO(@pravj): Handle when the user is not logged-in
    if (window.location.pathname === "/") {
        const checkExist = setInterval(function() {
            const moreFeedForm = document.querySelector('form[action*="/dashboard-feed"]');
            if (moreFeedForm !== null && moreFeedForm.parentElement.childElementCount > 1) {
                // Total activities in the feed, including a view "more" element
                const feedItemCount = moreFeedForm.parentElement.childElementCount;

                // Last activity timestamp will be needed to fetch activities after that
                const lastFeedItemDatetimeString = moreFeedForm.parentElement.children[feedItemCount - 2].querySelector('relative-time').getAttribute('datetime');
                const lastFeedItemTimestamp = Math.round(new Date(lastFeedItemDatetimeString).getTime()/1000);

                // Fetch activities after the last feed item timestamp
                getActivities(lastFeedItemTimestamp);

                clearInterval(checkExist);
            } else {
                // TODO(@pravj): there might be no activities, and the "more" element might be missing as well
                // Need to distinguish this block with the case when the periodic check is happening
                // console.log('Unable to add activities in feed. Raise an issue at https://github.com/follow-github-organisation');
            }
        }, 1000);
    }
}
