const { invoke } = window.__TAURI__.tauri

window.__TAURI__.app.getVersion().then((response) => {
    window.installerVersion.innerText = `v${response} • © 2021 - ${new Date(Date.now()).getFullYear()} ReGuilded. All rights reserved`;
})