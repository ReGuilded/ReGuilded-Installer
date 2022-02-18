const { shell } = require("electron");
const appUtil = require("./util");
const { access } = require("fs");

window.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const splashDiv = document.getElementById("loadingSplash");
    const versionText = document.getElementById("versionText");
    const uninjectBtn = document.getElementById("uninjectBtn");
    const installBtn = document.getElementById("installBtn");
    const statusText = document.getElementById("statusText");
    const updateBtn = document.getElementById("updateBtn");
    const injectBtn = document.getElementById("injectBtn");
    const mainDiv = document.getElementById("main");

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
    const platform = appUtil.platform;

    // Handle if the users' platform is unsupported.
    if (!platform) {
        statusText.innerHTML = `Your platform, ${process.platform}, is unsupported.` +
            "<br><button id='issueBtn' class='statusBtn' onclick='onclickIssue(\"UNSUPPORTED_PLATFORM\")'>Please submit a new issue.</button>"
        statusText.classList.remove("hidden");

        loadApp();
    } else {
        appUtil.gitHandler().then((release) => {
            if (release.versionString == null && release.downloadUrl == null) {
                statusText.innerHTML = `There was an issue contacting GitHub.` +
                    "<br><button id='issueBtn' class='statusBtn' onclick='onclickIssue(\"GITHUB_COMMUNICATION_ERROR\")'>Check GitHub Status</button>"
                statusText.classList.remove("hidden");

                loadApp();
            } else {
                versionText.innerText = release.versionString;
                versionText.href = release.browserUrl
                // versionText.onclick = function() { shell.openExternal(release.browserUrl)};

                // Checks if ~/.reguilded exists, using fs.constants.F_OK (default).
                access(platform.reguildedDir, async (err) => {
                    if (err) { // ReGuilded does not exist.
                        installBtn.classList.remove("hidden");
                    } else { // Reguilded Exists
                        updateBtn.classList.remove("hidden");

                        // Test if ReGuilded is Injected.
                        appUtil.isInjected(platform).then((isInjected) => {
                            if (!isInjected) {
                                // ReGuilded is not Injected so reveal the Injected Button.
                                injectBtn.classList.remove("hidden");
                            } else if (isInjected) {
                                // ReGuilded is already Injected so reveal the Uninject Button.
                                uninjectBtn.classList.remove("hidden");
                            }
                        })
                    }

                    loadApp();
                });
            }
        });
    }
});