// Node
const actions = require("./actions");

let textValue, onclickValue = null;

// Variables
let _progressDebounce = false;
let _headerDebounce = false;
let _interval;

// Lang Strings
let lang = {
    uninject: {
        progress: "Uninjecting",
        success: "uninjecting"
    },

    install: {
        progress: "Installing",
        success: "installing"
    },

    inject: {
        progress: "Injecting",
        success: "injecting"
    },

    update: {
        progress: "Updating",
        success: "updating"
    }
}

// Error Handler
function handleError(error) {
    // Console the error (for debug).
    console.error(error);

    // Stop the Status Text.
    clearInterval(_interval);

    hideAllButtons();

    // Setup Error Status Text and replace Current Button.
    statusText.innerHTML = `An Error Occurred: <br /> ${error.name} <br /> CTRL/CMD + R to refresh.`;
    statusText.classList.remove("hidden");
}

// Success Handler
function handleSuccess(buttons) {
    // Stop the Status Text.
    clearInterval(_interval);

    hideAllButtons();
    showButtons(buttons);
    statusText.classList.add("hidden");
}

function showButtons(buttons) {
    for (let button in buttons) {
        button = buttons[button];

        if (button.classList.contains("hidden"))
            button.classList.remove("hidden");
    }
}

function hideButtons(buttons) {
    for (let button in buttons) {
        button = buttons[button];

        if (!button.classList.contains("hidden"))
            button.classList.add("hidden");
    }
}

// Easy Util to Hide All Buttons.
function hideAllButtons() { hideButtons(buttonElements); }

// Function for Status Text.
function itsWorking(element) {
    let origText = element.innerText;
    _interval = setInterval(function() {
        if (element.innerText === origText + "..." ) element.innerText = origText;
        else element.innerText = element.innerText + ".";
    }, 1000);
}

// In Progress Handler
function handleInProgress(task) {
    // Setup Status Text to replace Install Button.
    statusText.innerText = task;
    itsWorking(statusText);

    hideButtons(buttonElements);

    statusText.classList.remove("hidden");
}

// Minimize & Close controllers
function onclickHeader(task) {
    if (!_headerDebounce) {
        _headerDebounce = true;
        ipcRenderer.send("REGUILDED_INSTALLER", [task, null]);
        _headerDebounce = false;
    }
}

// Handle New Issue click.
async function onclickIssue(issue) {
    switch (issue) {
        case "UNSUPPORTED_PLATFORM":
            await shell.openExternal(`https://github.com/ReGuilded/ReGuilded-Setup/issues/new?labels=Unsupported+Platform&body=Title+says+it+all.&title=Unsupported+Platform:+${process.platform}.`);
            break;
        case "GITHUB_COMMUNICATION_ERROR":
            await shell.openExternal(`https://www.githubstatus.com/`);
            break;
    }
}

async function onclickButton(task) {
    // Check Debounce
    if (!_progressDebounce) {
        // Set Debounce.
        _progressDebounce = true;
        const langStrings = lang[task];

        // Call In Progress Handler.
        handleInProgress(langStrings.progress + " ReGuilded")

        actions[task]().then((buttonNames) => {
            let buttons = {}
            buttonNames.forEach(buttonName => {
               buttons[buttonName] = buttonElements[buttonName]
            });

            handleSuccess(buttons)
            ipcRenderer.send("REGUILDED_INSTALLER", ["FINISHED_PROCESS", langStrings.success]);
        }).catch(handleError)

        _progressDebounce = false;
    }
}