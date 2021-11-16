const { join } = require("path");

const platforms = {
    linux: {
        dir: "/opt/Guilded/resources/app",
        execPath() {
            return "/opt/Guilded/guilded";
        },
        close: "killall guilded",
        open() {
            return this.execPath() + "& disown";
        }
    },
    darwin: {
        dir: "/Applications/Guilded.app/Contents/Resources/app",
        appPath() {
            return "/Applications/Guilded.app/Contents/Resources/app";
        },
        close: "killall Guilded",
        open() {
            return "open " + this.appPath();
        }
    },
    win32: {
        get dir() {
            return join(process.env.LOCALAPPDATA, "Programs/Guilded/resources/app");
        },
        get name() {
            return "Guilded";
        },
        execPath() {
            return process.env.LOCALAPPDATA + "/Programs/Guilded/Guilded.exe";
        },
        close: "taskkill /f /IM Guilded.exe >nul",
        open() {
            return this.execPath();
        }
    }
}
const current = platforms[process.platform]

module.exports = current
