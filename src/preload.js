const { shell } = require("electron");
const appUtil = require("./app/util");
const { join } = require("path");
const { access } = require("fs");

// Expected ~/.reguilded path.
const reguildedPath = join(process.env.APPDATA ?? process.env.HOME, ".reguilded");
window.reguildedPath = reguildedPath;

window.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const statusText = document.getElementById("statusText");
    const versionText = document.getElementById("versionText");
    const installBtn = document.getElementById("installBtn");
    const injectBtn = document.getElementById("injectBtn");
    const uninjectBtn = document.getElementById("uninjectBtn");

    // Get Platform Module.
    const platform = appUtil.platform;

    // Handle if the users platform is not supported.
    if (!platform) {
        statusText.innerHTML = `Your platform, ${process.platform}, is unsupported.` +
            "<br><button id='issueBtn' class='statusBtn' onclick='onclickIssue(\"UNSUPPORTED_PLATFORM\")'>Please submit a new issue.</button>"
        statusText.classList.remove("hidden");

        return;
    }

    window.platform = platform;

    const gitHandler = appUtil.gitHandler;
    await gitHandler.latestCommit.populate();
    await gitHandler.latestRelease.populate();

    if (gitHandler.latestRelease.commit == null || gitHandler.latestCommit.commit == null) {
        statusText.innerHTML = `There was an issue contacting GitHub.` +
            "<br><button id='issueBtn' class='statusBtn' onclick='onclickIssue(\"GITHUB_COMMUNICATION_ERROR\")'>Check GitHub Status</button>"
        statusText.classList.remove("hidden");
        return;
    }

    let re = new RegExp(":(.*)");
    versionText.innerText = "v" + gitHandler.latestRelease.release.name.replace(re, "");
    versionText.onclick = function() { shell.openExternal(gitHandler.latestRelease.release.html_url)};

    // Checks if ~/.reguilded exists, using fs.constants.F_OK (default).
    access(reguildedPath, async (err) => {
        if (err) {  // ~/.reguilded does not exist.
            installBtn.classList.remove("hidden");
        } else {    // ~/.reguilded exists.
            appUtil.isInjected(platform).then((isInjected) => {
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
});