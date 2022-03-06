// Custom Modules
const { isInjected } = require("../util");

// NPM Modules
const { createWriteStream } = require("fs-extra");
const sudo = require("sudo-prompt");
const { stream } = require("got");
const { join } = require("path");

module.exports = () => {
    return new Promise(async (resolve, reject) => {
        process.noAsar = true;
        const downloadUrl = window.gitRelease.downloadUrl
        const downloadPath = join(window.platform.tempDir, "reguilded.asar");

        await new Promise((downloadResolve) => {
            try {
                stream(downloadUrl)
                    .pipe(createWriteStream(downloadPath))
                    .on("finish", async () => {
                        downloadResolve()
                    });
            } catch (err) {
                reject(err);
            }
        });

        let command = ""
        if (["linux", "darwin"].includes(process.platform)) {
            command = `mkdir -p ${JSON.stringify(window.platform.reguildedDir)} && ` +
                `mv -f ${JSON.stringify(downloadPath)} ${JSON.stringify(join(window.platform.reguildedDir, "reguilded.asar"))} && ` +
                `chmod -R 777 ${JSON.stringify(window.platform.reguildedDir)}`
        } else if (["win32"].includes(process.platform)) {
            command = `mkdir ${JSON.stringify(window.platform.reguildedDir)} 2>nul & ` +
                `move /Y ${JSON.stringify(downloadPath)} ${JSON.stringify(join(window.platform.reguildedDir, "reguilded.asar"))} & ` +
                `icacls ${JSON.stringify(window.platform.reguildedDir)} /grant "Authenticated Users":(OI)(CI)F`
        }

        await new Promise((moveResolve) => {
            sudo.exec(command, {name: "ReGuilded Installer"}, (err, stdout, stderr) => {
                if (err) reject(err);
                if (stderr) console.log(stderr);

                moveResolve();
            });
        });

        process.noAsar = false;
        resolve(["update", await isInjected() ? "uninject" : "inject"]);
    });
}