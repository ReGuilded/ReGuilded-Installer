const { ipcRenderer } = require("electron");

let _debounce = false;

function onclickInstall() {
    if (!_debounce) {
        _debounce = true;

        // Git Fetch Latest Release Commit...
        // Change Button to Inject...

        _debounce = false;
    }
}

function onclickHeader(task) {
    if (!_debounce) {
        _debounce = true;
        ipcRenderer.send("reguilded_setup", task);
        _debounce = false;
    }
}