const { access, rm } = require("fs");
const { exec } = require("child_process");
const {join} = require("path");
const sudo = require("sudo-prompt");

module.exports = async() => {
    // Define Guilded Directory from Global Variable for easy access.
    const guildedDir = window.platform.dir;

    // Double Check if ReGuilded is injected.
    access(guildedDir, async(err) => {
        if (!err) { // Is Injected

            // Promise so the menu waits.
            await new Promise((resolve, reject) => {

                // Removes the Guilded/Resources/App directory.
                // Elevate for Linux and run Terminal Commands
                // Or use FS for Windows & Mac
                if (process.platform === "linux" && process.getuid() !== 0) {
                    const command = `rm -rf ${guildedDir}`
                    sudo.exec(command, {name: "ReGuilded Installer"}, function(err, stdout, stderr) {
                        if (err) throw reject(err);
                        else resolve();
                    });
                } else {
                    rm(guildedDir, {force: true, recursive: true}, async (err) => {
                        if (err) throw reject(err);
                        else resolve();
                    });
                }
            })

            // Relaunch Guilded
            exec(window.platform.close, () => {
                exec(window.platform.open(), (openError) => {
                    if (openError)
                        throw new Error("E" + openError);
                })
            })
        } else throw new Error("INJECTION_NOT_FOUND");
    })
}