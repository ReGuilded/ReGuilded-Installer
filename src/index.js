const { app, BrowserWindow, ipcMain } = require("electron");
const { join } = require("path");

function createWindow() {
    const injectWindow = new BrowserWindow({
        resizable: false,
        width: 300,
        height: 420,
        titleBarStyle: 'customButtonsOnHover',
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            preload: join(__dirname, "preload.js")
        }
    })

    injectWindow.loadFile(join(__dirname, "app/index.html"));

    ipcMain.on("reguilded_setup", (event, arg) => {
        if (["minimize", "close"].includes(arg)) { injectWindow[arg](); }
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", function() {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", function() {
   if (process.platform !== "darwin") app.quit();
});