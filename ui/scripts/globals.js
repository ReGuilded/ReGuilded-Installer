const { invoke } = window.__TAURI__.tauri

invoke("get_installer_version").then((response) => {
    window.installerVersion.innerText = `${response} • © 2021 - ${new Date(Date.now()).getFullYear()} ReGuilded. All rights reserved`;
})