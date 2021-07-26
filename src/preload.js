const appUtil = require("./app/util");
const { join } = require("path");
const { access } = require("fs");

// Expected ~/.reguilded path.
const reguildedPath = join(process.env.APPDATA ?? process.env.HOME, ".reguilded");
window.reguildedPath = reguildedPath;

window.addEventListener('DOMContentLoaded', () => {
    // Elements
    const statusText = document.getElementById("statusText");
    const installBtn = document.getElementById("installBtn");
    const injectBtn = document.getElementById("injectBtn");
    const uninjectBtn = document.getElementById("uninjectBtn");

    // Get Platform Module.
    const [platformModule, error] = appUtil.getPlatformModule();

    // Handle if the users platform is not supported.
    if (error === "UNSUPPORTED_PLATFORM") {
        statusText.innerHTML = `Your platform, ${process.platform}, is unsupported.` +
            "<br><button id='issueBtn' class='statusBtn' onclick='onclickIssue(\"UNSUPPORTED_PLATFORM\")'>Please submit a new issue.</button>"
        statusText.classList.remove("hidden");
    } else if (platformModule !== null) {   // If the users platform is supported.
        window.platformModule = platformModule;

        // Checks if ~/.reguilded exists, using fs.constants.F_OK (default).
        access(reguildedPath, async (err) => {
            if (err) {  // ~/.reguilded does not exist.
                installBtn.classList.remove("hidden");
            } else {    // ~/.reguilded exists.
                appUtil.isInjected(platformModule).then((isInjected) => {
                    if (!isInjected) {
                        // ReGuilded is not Injected so reveal the Injected Button.
                        injectBtn.classList.remove("hidden");
                    } else if (isInjected) {
                        // ReGuilded is already Injected so reveal the Uninject Button.
                        uninjectBtn.classList.remove("hidden");
                    }
                });
            }
        });
    }
});

