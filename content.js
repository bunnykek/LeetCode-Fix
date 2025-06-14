//by @bunnykek or lc: bunny404

const DISLIKE_ELE = `<div class="dislike_count"></div>`;
const THUMBS_UP_SELECTOR = '[data-icon="thumbs-up"]';
const THUMBS_DOWN_SELECTOR = '[data-icon="thumbs-down"]';

async function manipulate() {
    const url = window.location.href;
    const problemId = url.match(/https:\/\/leetcode\.com\/problems\/([a-z0-9\-]+)/)[1];
    const query = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          likes
          dislikes
        }
      }
    `;
    const response = await fetch('https://leetcode.com/graphql/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query,
            variables: { titleSlug: problemId },
            operationName: 'questionData'
        })
    });
    const jresp = await response.json();
    const num_likes = jresp['data']['question']['likes'];
    const num_dislikes = jresp['data']['question']['dislikes'];
    console.log("likes", num_likes);
    console.log("dislikes", num_dislikes);

    const thumbsUpButton = document.querySelector(THUMBS_UP_SELECTOR)?.closest('button');
    const thumbsDownButton = document.querySelector(THUMBS_DOWN_SELECTOR)?.closest('button');
    thumbsDownButton.insertAdjacentHTML('afterend', DISLIKE_ELE);
    thumbsDownButton.parentElement.addEventListener('click', dislikeHandler);

    thumbsUpButton.lastElementChild.innerHTML = num_likes;
    thumbsDownButton.lastElementChild.innerHTML = num_dislikes;
    thumbsDownButton.classList = thumbsUpButton.classList;
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
    const selector = document.querySelector(THUMBS_DOWN_SELECTOR).parentElement;
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
