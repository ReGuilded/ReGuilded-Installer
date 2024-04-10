/* Init Handler */
invoke("get_rg_install")
    .then(() => {
        toggleElement(window.utilScreen, true)
    })
    .catch((error) => {
        switch (error) {
            case "NOT_SUPPORTED":
                window.errorScreenText.innerHTML = "Uh Oh! It looks like your<br />Operating System is unsupported!"
                toggleElement(window.errorScreen, true)
                return;
            case "NO_INSTALL":
                toggleElement(window.errorScreen, true)
                return;
        }
    })

/* Element Handler */
function toggleElement(screen, isShown) {
    switch (isShown) {
        case true:
            screen.classList.remove("hidden");
            return;
        case false:
            screen.classList.add("hidden");
            return;
    }
}

/* Error Screen Handling */
window.newInstallText.addEventListener("click", () => {
    toggleElement(window.errorScreen, false)
    toggleElement(window.newInstallScreen, true)
    toggleElement(window.installButton, true);
})