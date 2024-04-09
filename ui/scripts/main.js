/* Init Handler */
invoke("get_rg_install")
    .then(() => {
        toggleScreen(window.utilScreen, true)
    })
    .catch((error) => {
        switch (error) {
            case "NOT_SUPPORTED":
                window.errorScreenText.innerHTML = "Uh Oh! It looks like your<br />Operating System is unsupported!"
                toggleScreen(window.errorScreen, true)
                return;
            case "NO_INSTALL":
                console.log("HAHA");
                toggleScreen(window.errorScreen, true)
                return;
        }
    })

/* Screen Handler */
function toggleScreen(screen, isShown) {
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
