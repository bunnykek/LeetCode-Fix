//by @bunnykek or lc: bunny404

DISLIKE_ELE =  `<div class="dislike_count"></div>`

async function manipulate() {
    let url = window.location.href;
    const match = url.match(/https:\/\/leetcode\.com\/problems\/([a-z0-9\-]+)/)
    console.log("Running extension for ", url)
    console.log("doing post req");
    let response = await fetch("https://leetcode.com/graphql/", {
    "headers": {
        "content-type": "application/json"
    },
    "body": `{\"query\":\"\\n    query questionTitle($titleSlug: String!) {\\n  question(titleSlug: $titleSlug) {\\n  dislikes\\n  }\\n}\\n    \",\"variables\":{\"titleSlug\":\"${match[1]}\"},\"operationName\":\"questionTitle\"}`,
    "method": "POST"
    });
    let jresp = await response.json()
    console.log("dislikes", jresp['data']['question']['dislikes']);
    const flag = document.getElementsByClassName("dislike_count")
    if(flag == null){
        let selector = document.querySelector("[data-icon='thumbs-down']");
        selector.insertAdjacentHTML('afterend', DISLIKE_ELE)
    }
    document.getElementsByClassName("dislike_count")[0].innerHTML = jresp['data']['question']['dislikes'];
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

waitForElm("[data-icon='thumbs-down']").then((elm) => {
    console.log('Page reloaded');
    let selector = document.querySelector("[data-icon='thumbs-down']");
    selector.insertAdjacentHTML('afterend', DISLIKE_ELE)
    manipulate();
});

let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  const match = url.match(/https:\/\/leetcode\.com\/problems\/([a-z0-9\-]+)/)
  if (!lastUrl.includes(match[1])) {
    lastUrl = url;
    waitForElm("[data-icon='thumbs-down']").then((elm) => {
        console.log('Element is ready');
        manipulate();
    });
  }
}).observe(document, {subtree: true, childList: true});
