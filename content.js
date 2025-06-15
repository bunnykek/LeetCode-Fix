//by @bunnykek or lc: bunny404

const EMPTY_DIV = `<div></div>`;
const THUMBS_UP_SELECTOR = '[data-icon="thumbs-up"]';
const THUMBS_DOWN_SELECTOR = '[data-icon="thumbs-down"]';

function handleThumbsClick(event) {
    const thumbsButton = event.srcElement.closest('button');
    const toggled = thumbsButton.firstElementChild.firstElementChild.getAttribute('data-prefix') == 'far';
    const count = thumbsButton.lastElementChild.innerHTML;
    thumbsButton.lastElementChild.innerHTML = parseInt(count) + (toggled ? 1 : -1);
}

const LIKES_DISLIKES_CACHE_KEY = 'violentmonkey_lcLikesDislikesCache';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
async function getLikesAndDislikes(problemId) {
    let cache = {};
    const rawCache = localStorage.getItem(LIKES_DISLIKES_CACHE_KEY);
    if (rawCache) {
        try {
            cache = JSON.parse(rawCache);
        } catch (_) {
            cache = {};
        }
    }
    const entry = cache[problemId];
    if (entry && Date.now() - entry.ts < ONE_DAY_MS) {
        return { likes: entry.likes, dislikes: entry.dislikes };
    }

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
    const { data } = await response.json();
    const result = {
        likes: data.question.likes,
        dislikes: data.question.dislikes
    };

    cache[problemId] = { ...result, ts: Date.now() };
    localStorage.setItem(LIKES_DISLIKES_CACHE_KEY, JSON.stringify(cache));
    return result;
}

function manipulateDislikes(thumbsUpButton, thumbsDownButton, dislikes) {
    // Add div and click handler if needed
    if (thumbsDownButton.childElementCount == 1) {
        thumbsDownButton.lastElementChild.insertAdjacentHTML('afterend', EMPTY_DIV);
        thumbsDownButton.addEventListener('click', handleThumbsClick);
        // Copy css from like button to dislike button
        thumbsDownButton.classList = thumbsUpButton.classList;
    }

    // Update count
    thumbsDownButton.lastElementChild.innerHTML = dislikes;
}

let thumbsUpListenerAdded = false;
function manipulateLikes(thumbsUpButton, newLikes) {
    thumbsUpButton.lastElementChild.innerHTML = newLikes;
    if (!thumbsUpListenerAdded) {
        thumbsUpButton.addEventListener('click', handleThumbsClick);
        thumbsUpListenerAdded = true;
    }
}

function waitForElementToExist(selector) {
    return new Promise(resolve => {
        let element = document.querySelector(selector);
        if (element) {
            return resolve(element);
        }
        const observer = new MutationObserver(() => {
            element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                clearTimeout(observerTimeout);
                resolve(element);
            }
        });
        const observerTimeout = setTimeout(() => observer.disconnect(), 5000);
        observer.observe(document.body, { childList: true, subtree: true });
    });
}

function waitForInnerHTMLChange(element, initialValue) {
    return new Promise(resolve => {
        if (element.innerHTML != initialValue) {
            return resolve();
        }
        const observer = new MutationObserver(() => {
            if (element.innerHTML != initialValue) {
                observer.disconnect();
                clearTimeout(observerTimeout);
                resolve();
            }
        });
        const observerTimeout = setTimeout(() => observer.disconnect(), 5000);
        observer.observe(element, { childList: true, subtree: true, characterData: true });
    });
}

function getProblemId() {
    const url = window.location.href;
    const matches = url.match(/problems\/([a-z0-9\-]+)/);
    if (matches) {
        return matches[1];
    }
    return null;
}

let prevProblemId;
let prevLikes;
new MutationObserver(async () => {
    const problemId = getProblemId();
    if (!problemId || problemId == prevProblemId) {
        prevProblemId = problemId;
        return;
    }

    prevProblemId = problemId; // pre-emptively do this to prevent async mutations from triggering
    const { likes, dislikes } = await getLikesAndDislikes(problemId);
    console.log('likes:', likes);
    console.log('dislikes:', dislikes);

    let thumbsUpButton;
    await waitForElementToExist(THUMBS_UP_SELECTOR).then(
        async thumbsUpIcon => {
            thumbsUpButton = thumbsUpIcon.closest('button');
            // If the new problem has a different like count or more than 1K likes
            // Then wait for page to update with the new like count
            if (prevLikes && (likes != prevLikes || likes >= 1000)) {
                await waitForInnerHTMLChange(thumbsUpButton.lastElementChild, prevLikes.toString());
            }
        }
    )
    // Update likes count
    manipulateLikes(thumbsUpButton, likes);
    prevLikes = likes;

    // Update dislikes count
    const thumbsDownButton = document.querySelector(THUMBS_DOWN_SELECTOR).closest('button');
    manipulateDislikes(thumbsUpButton, thumbsDownButton, dislikes);
}).observe(document.body, { subtree: true, childList: true });
