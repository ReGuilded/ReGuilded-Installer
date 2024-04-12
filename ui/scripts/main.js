/* Init Handler */
invoke("get_rg_install")
    .then(() => {
        getRgPath();
        toggleElement(window.utilScreen, true)
    })
    .catch((error, defaultRgPath) => {
        switch (error) {
            case "NOT_SUPPORTED":
                window.errorScreenText.innerHTML = "Uh Oh! It looks like your<br />Operating System is unsupported!"
                toggleElement(window.errorScreen, true)
                return;
            case "NO_INSTALL":
                getRgPath();
                toggleElement(window.errorScreen, true)
                return;
        }
    })

let reguildedPath;
function getRgPath() {
    invoke("get_rg_path").then((defaultRgPath) => {
        reguildedPath = defaultRgPath;
        window.locationText.innerText = reguildedPath;
    })
}

/* Element Handler */
function toggleElement(element, isShown) {
    switch (isShown) {
        case true:
            element.classList.remove("hidden");
            return;
        case false:
            element.classList.add("hidden");
            return;
    }
}

/* Error Screen Handling */
window.newInstallText.addEventListener("click", () => {
    toggleElement(window.errorScreen, false)
    toggleElement(window.newInstallScreen, true)
    toggleElement(window.installButton, true);
})

/* Install Screen Handling */
const { resolveResource } = window.__TAURI__.path;
const { readTextFile } = window.__TAURI__.fs;
const { open } = window.__TAURI__.dialog;
let currentChannel = "stable";

window.releaseChannel.append(new Option("Stable", "stable", true));
window.releaseChannel.append(new Option("Legacy", "legacy"));

(async() => {
    const releasesPath = await resolveResource("resources/releases.json");
    const releases = JSON.parse(await readTextFile(releasesPath));

    releases.forEach((release) => {
        const option = new Option(release.tag_name, release.tag_name);
        const releaseName = release.name.toLowerCase();

        if (!releaseName.includes("[legacy]") &&
            !releaseName.includes("[broken]") &&
            !releaseName.includes("[legacy/broken]")
        ) {
            option.setAttribute("data-value", "stable")
        } else {
            option.setAttribute("data-value", "legacy")
            option.classList.add("hidden");
        }

        window.releaseVersion.append(option)
    })
})();

const versionElements = window.releaseVersion.getElementsByTagName("option");

function toggleVersions(channelString, isShown) {
    let defaultVersionHandled = false;

    for (let versionElement of versionElements) {
        let dataValue = versionElement.getAttribute("data-value");
        if (dataValue === channelString) {
            toggleElement(versionElement, isShown);

            if (isShown && !defaultVersionHandled) {
                versionElement.selected = true;
                defaultVersionHandled = true;
            }
        }
    }
}

window.releaseChannel.addEventListener("change", () => {
    switch (window.releaseChannel.value) {
        case "stable":
            toggleVersions(currentChannel, false);
            toggleVersions("stable", true);

            currentChannel = "stable";
            return;
        case "dev":
            toggleVersions(false);
            toggleVersions("dev", true);

            currentChannel = "dev";
            return;
        case "legacy":
            toggleVersions(currentChannel, false);
            toggleVersions("legacy", true);

            currentChannel = "legacy";
            return;
        default:
            console.error("How did we get here.");
            return;
    }
})

window.locationContainer.addEventListener("click", async () => {
    const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: reguildedPath
    })

    if (selected !== null) {
        window.locationText.innerText = selected;
        reguildedPath = selected;
    }
})