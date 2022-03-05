const { join } = require("path");

const platforms = {
    linux: {
        close: "killall guilded",
        appName: "guilded",
        reguildedDir: "/usr/local/share/ReGuilded",
        resourcesDir: "/opt/Guilded/resources",
        tempDir: "/tmp/",
        get appDir() {
            return join(this.resourcesDir, "app")
        },
        get open() {
            return "/opt/Guilded/guilded& disown"
        }
    },
    darwin: {
        close: "killall Guilded",
        appName: "Guilded",
        reguildedDir: "/Applications/ReGuilded",
        resourcesDir: "/Applications/Guilded.app/Contents/Resources",
        get tempDir() {
            return process.env.TMPDIR
        },
        get appDir() {
            return join(this.resourcesDir, "app");
        },
        get open() {
            return "/Applications/Guilded.app";
        }
    },
    win32: {
        close: "taskkill /f /IM Guilded.exe >nul",
        appName: "Guilded.exe",
        get reguildedDir() {
            return join(process.env.ProgramW6432, "ReGuilded");
        },
        get resourcesDir() {
            return join(process.env.LOCALAPPDATA, "Programs/Guilded/resources");
        },
        get tempDir() {
            return process.env.TEMP
        },
        get appDir() {
            return join(this.resourcesDir, "app");
        },
        get open() {
            return join(process.env.LOCALAPPDATA, "Programs/Guilded/Guilded.exe") + " >nul";
        }
    }
}

module.exports = platforms[process.platform] || undefined
