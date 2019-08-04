chrome.runtime.onInstalled.addListener(function (tab) {
    chrome.tabs.create({ url: chrome.extension.getURL('newtab.html'), active: true });
});

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({ url: chrome.extension.getURL('newtab.html'), active: true });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");

    if (request.event === "open_extension_tab") {
        chrome.tabs.create({ url: chrome.extension.getURL('newtab.html'), active: true });
        sendResponse({status: "tab_created"});
    }
});
