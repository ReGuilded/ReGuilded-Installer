const { ipcRenderer, shell } = require("electron");
const { exec } = require("child_process");
const appUtil = require("./util");
const { access } = require("fs");

// Nasty big variable initializer
let splashDiv, mainDiv, versionText, statusText, buttonElements, platform = null;

window.addEventListener('DOMContentLoaded', async () => {
    // Div Elements
    splashDiv = document.getElementById("loadingSplash");
    mainDiv = document.getElementById("main");

    // Text Elements
    versionText = document.getElementById("versionText");
    statusText = document.getElementById("statusText");

    // Button Elements
    buttonElements = {
        uninject: document.getElementById("uninjectBtn"),
        install: document.getElementById("installBtn"),
        update: document.getElementById("updateBtn"),
        inject: document.getElementById("injectBtn")
    }

    function loadApp() {
        mainDiv.classList.remove("hidden");
        splashDiv.classList.add("hiding");

        setTimeout(() => {
            splashDiv.remove();

            const script = document.createElement("script");
            script.src = "./index.js";
            document.body.append(script);
        }, 200)
    }

    // Get Platform Module.
    window.platform = appUtil.platform;
    platform = window.platform;

    // Handle if the users' platform is unsupported.
    if (!platform) {
        statusText.innerHTML = `Your platform, ${process.platform}, is unsupported:` +
            `<br><br>` +
            `<span class='statusBtn' onclick='onclickIssue(\"UNSUPPORTED_PLATFORM\")'>Click here to submit a New Issue.</span>`
        statusText.classList.remove("hidden");

        loadApp();
    } else {
        appUtil.gitHandler().then((release) => {
            window.gitRelease = release;
            if (!release || release.versionString == null || release.downloadUrl == null) {
                statusText.innerHTML = `Issue retrieving ReGuilded Release:` +
                    `<br><br>` +
                    `<span class='statusBtn' onclick='onclickIssue(\"GITHUB_RELEASES\")'>Click here to check ReGuilded Releases.</span>` +
                    `<br>` +
                    `<span class='statusBtn' onclick='onclickIssue(\"GITHUB_STATUS\")'>Click here to check GitHub Status.</span>`
                statusText.classList.remove("hidden");

                loadApp();
            } else {
                versionText.innerText = release.versionString;
                versionText.onclick = function() { shell.openExternal(release.browserUrl)};

                // Checks if ~/.reguilded exists, using fs.constants.F_OK (default).
                access(platform.reguildedDir, async (err) => {
                    if (err) { // ReGuilded does not exist.
                        buttonElements.install.classList.remove("hidden");
                    } else { // Reguilded Exists
                        buttonElements.update.classList.remove("hidden");

                        // Test if ReGuilded is Injected.
                        appUtil.isInjected().then((isInjected) => {
                            if (!isInjected) {
                                // ReGuilded is not Injected so reveal the Injected Button.
                                buttonElements.inject.classList.remove("hidden");
                            } else {
                                // ReGuilded is already Injected so reveal the Uninject Button.
                                buttonElements.uninject.classList.remove("hidden");
                            }
                        })
                    }

                    loadApp();
                });
            }
        });
    }
});

let _headerDebounce = false;
// Minimize & Close controllers
function onclickHeader(task) {
    if (!_headerDebounce) {
        _headerDebounce = true;
        ipcRenderer.send("REGUILDED_INSTALLER", [task, null]);
        _headerDebounce = false;
    }
}

// Handle Issue click.
async function onclickIssue(issue) {
    switch (issue) {
        case "UNSUPPORTED_PLATFORM":
            await shell.openExternal(`https://github.com/ReGuilded/ReGuilded-Setup/issues/new?labels=Unsupported+Platform&body=Title+says+it+all.&title=Unsupported+Platform:+${process.platform}.`);
            break;
        case "GITHUB_RELEASES":
            await shell.openExternal(`https://github.com/ReGuilded/ReGuilded/releases`);
            break;
        case "GITHUB_STATUS":
            await shell.openExternal(`https://www.githubstatus.com/`);
            break;
    }
}