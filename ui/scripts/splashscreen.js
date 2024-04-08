const loadingMsgs = [
    "Cooking up the good stuff!",
    "Almost there... Maybe!",
    "I have no idea if this will finish.",
    "Hopefully nothing goes wrong.",
    "This should take too long...",
    "Please wait...",
    "Loading assets...",
]

function getRandomIntInclusive() {
    const minCeiled = Math.ceil(0);
    const maxFloored = Math.floor(loadingMsgs.length - 1);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

window.loadingText.innerText = loadingMsgs[getRandomIntInclusive()];

window.installerVersion.innerHTML = window.installerVersion.innerHTML.replace(" • ", "<br />")