//by @bunnykek or lc: bunny404

const EMPTY_DIV = `<div></div>`;
const THUMBS_UP_SELECTOR = '[data-icon="thumbs-up"]';
const THUMBS_DOWN_SELECTOR = '[data-icon="thumbs-down"]';

function handleThumbsDownClick(event) {
    const thumbsDownButton = event.srcElement.closest('button');
    const toggled = thumbsDownButton.firstElementChild.firstElementChild.getAttribute('data-prefix') == 'far';
    const numDislikes = thumbsDownButton.lastElementChild.innerHTML;
    thumbsDownButton.lastElementChild.innerHTML = parseInt(numDislikes) + (toggled ? 1 : -1);
}

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

    const thumbsUpButton = document.querySelector(THUMBS_UP_SELECTOR).closest('button');
    const thumbsDownButton = document.querySelector(THUMBS_DOWN_SELECTOR).closest('button');
    thumbsDownButton.lastElementChild.insertAdjacentHTML('afterend', EMPTY_DIV);
    thumbsUpButton.lastElementChild.innerHTML = num_likes;
    thumbsDownButton.lastElementChild.innerHTML = num_dislikes;
    thumbsDownButton.addEventListener('click', handleThumbsDownClick);

    // Copy css from like button to dislike button
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

waitForElm(THUMBS_DOWN_SELECTOR).then((elm) => {
    console.log('Page reloaded');
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
