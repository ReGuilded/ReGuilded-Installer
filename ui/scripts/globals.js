const { invoke } = window.__TAURI__.tauri

const isSplashscreen = window.location.pathname === "/splashscreen.html"

window.__TAURI__.app.getVersion().then((response) => {
    window.installerVersion.innerHTML = `v${response}${!isSplashscreen ? " • " : "<br />"}© 2021 - ${new Date(Date.now()).getFullYear()} ReGuilded. All rights reserved`;
})