const { Notification, BrowserWindow, ipcMain, app } = require("electron");
const { join } = require("path");

const iconPath = join(__dirname, "app/assets/reguilded.ico");
function createWindow() {
    const injectWindow = new BrowserWindow({
        resizable: false,
        width: 300,
        height: 420,
        titleBarStyle: 'customButtonsOnHover',
        frame: false,
        icon: iconPath,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        }
    })

    injectWindow.loadFile(join(__dirname, "app/index.html"));

    ipcMain.on("reguilded_setup", (event, arg) => {
        if (["minimize", "close"].includes(arg)) injectWindow[arg]();
        else if (arg === "finished_install") new Notification({title: "ReGuilded Setup", body: "ReGuilded has finished installing!", icon: iconPath}).show();
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", function() {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    if (process.platform === 'win32') app.setAppUserModelId("ReGuilded Setup");
});

app.on("window-all-closed", function() {
   if (process.platform !== "darwin") app.quit();
});