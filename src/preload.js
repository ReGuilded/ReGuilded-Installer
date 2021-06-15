const { join } = require("path");
const { access } = require("fs");

// Expected ~/.reguilded path.
const reguildedPath = join(process.env.APPDATA ?? process.env.HOME, ".reguilded");

window.addEventListener('DOMContentLoaded', () => {
    // Elements
    const statusText = document.getElementById("statusText");
    const installBtn = document.getElementById("installBtn");
    const injectBtn = document.getElementById("injectBtn");
    const uninjectBtn = document.getElementById("uninjectBtn");

    // Checks if ~/.reguilded exists, using fs.constants.F_OK (default).
    access(reguildedPath, (err) => {
        if (err) {  // ~/.reguilded does not exist.
            // Starts of allowing Custom Install Location.
            // statusText.innerHTML = "Already Installed? " +
            //     "<button id='browseBtn' class='browse' onclick='onclickBrowse()'>Browse</button>.";
            // statusText.classList.remove("hidden");

            installBtn.classList.remove("hidden");
        } else {    // ~/.reguilded exists.
            const { isInjected } = require(join(reguildedPath, "inject/injectUtil"));

            if (isInjected() == null) {
                statusText.innerText = "There was an error.";
                statusText.classList.remove("hidden");
            }

            // Check if ReGuilded is already Injected.
            if (!isInjected()) {
                injectBtn.classList.remove("hidden");
            } else {
                uninjectBtn.classList.remove("hidden");
            }
        }
    });
});

