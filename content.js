//by @bunnykek or lc: bunny404

const DISLIKE_ELE = `<div class="dislike_count"></div>`;
const THUMBS_UP_SELECTOR = '[data-icon="thumbs-up"]';
const THUMBS_DOWN_SELECTOR = '[data-icon="thumbs-down"]';

function applyStyles() {
    const thumbsUp = document.querySelector(THUMBS_UP_SELECTOR)?.closest('button');
    const thumbsDown = document.querySelector(THUMBS_DOWN_SELECTOR)?.closest('button');
    if (thumbsUp && thumbsDown) {
        thumbsDown.classList = thumbsUp.classList;
    }
}

async function manipulate() {
    let url = window.location.href;
    const match = url.match(/https:\/\/leetcode\.com\/problems\/([a-z0-9\-]+)/);
    console.log("Running extension for ", url);
    console.log("doing post req");
    let response = await fetch("https://leetcode.com/graphql/", {
        "headers": {
            "content-type": "application/json"
        },
        "body": `{\"query\":\"\\n    query questionTitle($titleSlug: String!) {\\n  question(titleSlug: $titleSlug) {\\n  dislikes\\n  }\\n}\\n    \",\"variables\":{\"titleSlug\":\"${match[1]}\"},\"operationName\":\"questionTitle\"}`,
        "method": "POST"
    });
    let jresp = await response.json();
    console.log("dislikes", jresp['data']['question']['dislikes']);
    const flag = document.getElementsByClassName("dislike_count");
    if (flag == null) {
        let selector = document.querySelector(THUMBS_DOWN_SELECTOR).parentElement;
        selector.insertAdjacentHTML('afterend', DISLIKE_ELE);
        selector.parentElement.addEventListener('click', dislikeHandler);
    }
    document.getElementsByClassName("dislike_count")[0].innerHTML = jresp['data']['question']['dislikes'];
    applyStyles();
}

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

let toggled = false;
function dislikeHandler() {
    toggled = !toggled;
    const dislike_count = document.getElementsByClassName("dislike_count")[0]?.innerHTML;
    if (dislike_count) {
        document.getElementsByClassName("dislike_count")[0].innerHTML = parseInt(dislike_count) + (toggled ? 1 : -1);
    }
}

waitForElm(THUMBS_DOWN_SELECTOR).then((elm) => {
    console.log('Page reloaded');
    let selector = document.querySelector(THUMBS_DOWN_SELECTOR).parentElement;
    selector.insertAdjacentHTML('afterend', DISLIKE_ELE);
    selector.parentElement.addEventListener('click', dislikeHandler);
    manipulate();
});

let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    const match = url.match(/https:\/\/leetcode\.com\/problems\/([a-z0-9\-]+)/);
    if (!lastUrl.includes(match[1])) {
        lastUrl = url;
        waitForElm(THUMBS_DOWN_SELECTOR).then((elm) => {
            console.log('Element is ready');
            manipulate();
        });
    }
}).observe(document, { subtree: true, childList: true });
