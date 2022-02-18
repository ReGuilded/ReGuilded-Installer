// Node
const { install, inject, uninject } = require("./actions");
const { ipcRenderer } = require("electron");

let textValue, onclickValue = null;

// Variables
let _debounce = false;
let _interval;

// Error Handler
function handleError(buttonElement, error) {
    // Console the error (for debug).
    console.error(error);

    // Stop the Status Text.
    clearInterval(_interval);

    // Setup Error Status Text and replace Current Button.
    statusText.innerText = "There was an error.";
    buttonElement.classList.add("hidden");
    statusText.classList.remove("hidden");
}

// Success Handler
function handleSuccess(element) {
    // Stop the Status Text.
    clearInterval(_interval);

    // Remove Status Text content and replace it.
    statusText.innerText = "";
    statusText.classList.add("hidden");
    element.classList.remove("hidden");
}

// In Progress Handler
function handleInProgress(element, task) {
    // Setup Status Text to replace Install Button.
    statusText.innerText = task;
    itsWorking(statusText);
    element.classList.add("hidden");
    statusText.classList.remove("hidden");
}


// Install Button handler.
installBtn.addEventListener("click", async function(event) {
    // Check Debounce.
    if (!_debounce) {
        // Set Debounce.
        _debounce = true;

        textValue = versionText.innerText;
        onclickValue = versionText.onclick;

        // Call In Progress Handler.
        handleInProgress(installBtn, "Installing ReGuilded");

        install().then(() => {
            // Setup Inject Button to replace Status Text.
            handleSuccess(injectBtn);

            // Send IPC for Computer Notification.
            ipcRenderer.send("reguilded_setup", "finished_install");
        }).catch((err) => { handleError(installBtn, err); })

        // Debounce Over
        _debounce = false;
    }
});

// Inject Button handler.
injectBtn.addEventListener("click", async function(event) {
    // Check Debounce
    if (!_debounce) {
        // Set Debounce.
        _debounce = true;

        // Call In Progress Handler.
        handleInProgress(injectBtn, "Injecting ReGuilded");

        // Inject ReGuilded
        inject().then(() => {
            // Setup Uninject Button to replace Status Text.
            handleSuccess(uninjectBtn);
        }).catch((err) => { handleError(injectBtn, err); });

        // Debounce Over
        _debounce = false;
    }
});

uninjectBtn.addEventListener("click", async function(event) {
    // Check Debounce
    if (!_debounce) {
        // Set Debounce.
        _debounce = true;

        // Call In Progress Handler.
        handleInProgress(uninjectBtn, "Uninjecting ReGuilded");

        uninject().then(() => {
            // Setup Uninject Button to replace Status Text.
            handleSuccess(injectBtn);
        }).catch((err) => { handleError(uninjectBtn, err); });

        // Debounce Over
        _debounce = false;
    }
});

// Minimize & Close controllers
function onclickHeader(task) {
    if (!_debounce) {
        _debounce = true;
        ipcRenderer.send("reguilded_setup", task);
        _debounce = false;
    }
}

// Function for Status Text.
function itsWorking(element) {
    let origText = element.innerText;
    _interval = setInterval(function() {
        if (element.innerText === origText + "..." ) element.innerText = origText;
        else element.innerText = element.innerText + ".";
    }, 1000);
}

// Handle New Issue click.
async function onclickIssue(issue) {
    switch (issue) {
        case "UNSUPPORTED_PLATFORM":
            await shell.openExternal(`https://github.com/ReGuilded/ReGuilded-Setup/issues/new?labels=Unsupported+Platform&body=Title+says+it+all.&title=Unsupported+Platform:+${process.platform}.`);
            break;
        case "GITHUB_COMMUNICATION_ERROR":
            await shell.openExternal(`https://www.githubstatus.com/`);
    }
}