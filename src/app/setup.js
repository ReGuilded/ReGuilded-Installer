const { ipcRenderer, shell } = require("electron");
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
        statusText.innerHTML = `Your platform, ${process.platform}, is unsupported.` +
            "<br><button id='issueBtn' class='statusBtn' onclick='onclickIssue(\"UNSUPPORTED_PLATFORM\")'>Please submit a new issue.</button>"
        statusText.classList.remove("hidden");

        loadApp();
    } else {
        appUtil.gitHandler().then((release) => {
            window.gitRelease = release;
            if (release.versionString == null && release.downloadUrl == null) {
                statusText.innerHTML = `There was an issue contacting GitHub.` +
                    "<br><button id='issueBtn' class='statusBtn' onclick='onclickIssue(\"GITHUB_COMMUNICATION_ERROR\")'>Check GitHub Status</button>"
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