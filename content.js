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

function getProblemId() {
    const url = window.location.href;
    return url.match(/https:\/\/leetcode\.com\/problems\/([a-z0-9\-]+)/)[1];
}

async function getLikesAndDislikes(problemId) {
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
    return {
        'likes': jresp['data']['question']['likes'],
        'dislikes': jresp['data']['question']['dislikes']
    };
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

function manipulateLikes(thumbsUpButton, newLikes) {
    // Replace truncated like count with the full like count
    const updateLikesInterval = setInterval(() => {
        const oldLikes = thumbsUpButton.lastElementChild.innerHTML;
        if (oldLikes.includes('.') || oldLikes.endsWith('K')) {
            thumbsUpButton.lastElementChild.innerHTML = newLikes;
            if (!manipulateLikes.listenerAdded) {
                thumbsUpButton.addEventListener('click', handleThumbsClick);
                manipulateLikes.listenerAdded = true;
            }
            clearInterval(updateLikesInterval);
        }
    }, 200);
    // Stop trying after 3s
    setTimeout(() => {
        clearInterval(updateLikesInterval);
    }, 3000);
}

function waitForElm(selector) {
    return new Promise(resolve => {
        let element = document.querySelector(selector);
        if (element) {
            return resolve(element)
        };

        const observer = new MutationObserver(() => {
            element = document.querySelector(selector);
            if (element) {
                resolve(element);
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    });
}

let prevProblemId;
new MutationObserver(async () => {
    const problemId = getProblemId();
    if (problemId != prevProblemId) {
        prevProblemId = problemId;
        const { likes, dislikes } = await getLikesAndDislikes(problemId);
        console.log(likes);
        console.log(dislikes);
        waitForElm(THUMBS_DOWN_SELECTOR).then(
            thumbsDownIcon => {
                const thumbsUpButton = document.querySelector(THUMBS_UP_SELECTOR).closest('button');
                const thumbsDownButton = thumbsDownIcon.closest('button')
                manipulateLikes(thumbsUpButton, likes);
                manipulateDislikes(thumbsUpButton, thumbsDownButton, dislikes);
            }
        );
    }
}).observe(document, { subtree: true, childList: true });
