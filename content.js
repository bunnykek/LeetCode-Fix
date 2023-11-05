//by @bunnykek or lc: bunny404

DISLIKE_ELE =  `<div class="relative inline-flex gap-2 items-center justify-center font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors bg-transparent enabled:hover:bg-fill-secondary enabled:active:bg-fill-primary text-body px-3 py-1.5 rounded-none text-text-secondary dark:text-text-secondary hover:text-text-secondary dark:hover:text-text-secondary"><svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="thumbs-up" class="svg-inline--fa fa-thumbs-up " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 110"><path fill="currentColor" d="M4,61.65H32.37a4,4,0,0,0,4-4V4a4.05,4.05,0,0,0-4-4H4A4,4,0,0,0,0,4V57.62a4,4,0,0,0,4,4ZM62.16,98.71a7.35,7.35,0,0,0,4.07,5.65,8.14,8.14,0,0,0,5.56.32,15.53,15.53,0,0,0,5.3-2.71,26.23,26.23,0,0,0,9.72-18.86,57.44,57.44,0,0,0-.12-8.35c-.17-2-.42-4-.76-6.15h20.2a21.57,21.57,0,0,0,9.1-2.32,14.87,14.87,0,0,0,5.6-4.92,12.59,12.59,0,0,0,2-7.52,18.1,18.1,0,0,0-1.82-6.92,21.87,21.87,0,0,0,.54-8.39,9.68,9.68,0,0,0-2.78-5.67,25.28,25.28,0,0,0-1.4-9.44,19.9,19.9,0,0,0-4.5-7,28.09,28.09,0,0,0-.9-5A17.35,17.35,0,0,0,109.5,6h0C106.07,1.14,103.33,1.25,99,1.43c-.61,0-1.26.05-2.26.05H57.39a19.08,19.08,0,0,0-8.86,1.78,20.9,20.9,0,0,0-7,6.06L41,11V56.86l2,.54c5.08,1.37,9.07,5.7,12.16,10.89a76,76,0,0,1,7,16.64V98.2l.06.51Zm6.32.78a2.13,2.13,0,0,1-1-1.57V84.55l-.12-.77a82.5,82.5,0,0,0-7.61-18.24C56.4,59.92,52,55.1,46.37,52.87V11.94a14.87,14.87,0,0,1,4.56-3.88,14.14,14.14,0,0,1,6.46-1.21H96.73c.7,0,1.61,0,2.47-.07,2.57-.11,4.2-.17,5.94,2.28v0a12.12,12.12,0,0,1,1.71,3.74,24.63,24.63,0,0,1,.79,5l.83,1.76a15,15,0,0,1,3.9,5.75,21.23,21.23,0,0,1,1,8.68l-.1,1.59,1.36.84a4.09,4.09,0,0,1,1.64,3,17.44,17.44,0,0,1-.68,7.12l.21,1.94A13.16,13.16,0,0,1,117.51,54a7.34,7.34,0,0,1-1.17,4.39,9.61,9.61,0,0,1-3.59,3.12,16,16,0,0,1-6.71,1.7H79.51l.6,3.18a85.37,85.37,0,0,1,1.22,8.78,51.11,51.11,0,0,1,.13,7.56,20.78,20.78,0,0,1-7.62,14.95,10.29,10.29,0,0,1-3.41,1.78,3,3,0,0,1-2,0ZM22.64,19.71a5.13,5.13,0,1,0-5.13-5.13,5.13,5.13,0,0,0,5.13,5.13Z"></path></svg><div id="dislike_added_lmao"></div></div>`

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
    const flag = document.getElementById("dislike_added_lmao")
    if(flag == null){
        let selector = document.querySelector("[data-icon='thumbs-up']").parentElement.parentElement;
        selector.insertAdjacentHTML('afterend', DISLIKE_ELE)
    }
    document.getElementById("dislike_added_lmao").innerHTML = jresp['data']['question']['dislikes'];
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

waitForElm("[data-icon='thumbs-up']").then((elm) => {
    console.log('Page reloaded');
    let selector = document.querySelector("[data-icon='thumbs-up']").parentElement.parentElement;
    selector.insertAdjacentHTML('afterend', DISLIKE_ELE)
    manipulate();
});

let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  const match = url.match(/https:\/\/leetcode\.com\/problems\/([a-z0-9\-]+)/)
  if (!lastUrl.includes(match[1])) {
    lastUrl = url;
    waitForElm("[data-icon='thumbs-up']").then((elm) => {
        console.log('Element is ready');
        manipulate();
    });
  }
}).observe(document, {subtree: true, childList: true});
