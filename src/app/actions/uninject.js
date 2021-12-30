const { access, rm } = require("fs");
const { exec } = require("child_process");
const sudo = require("sudo-prompt");

module.exports = async() => {
    return new Promise((resolve, reject) => {
        // Define Guilded Directory from Global Variable for easy access.
        const guildedDir = window.platform.dir;

        // Double Check if ReGuilded is injected.
        access(guildedDir, async(err) => {
            if (!err) { // Is Injected

                await new Promise((uninjectResolve) => {
                    // Removes the Guilded/Resources/App directory.
                    // Elevate for Linux and run Terminal Commands
                    // Or use FS for Windows & Mac
                    if (process.platform === "linux" && process.getuid() !== 0) {
                        const command = `rm -rf ${guildedDir}`
                        sudo.exec(command, {name: "ReGuilded Installer"}, function(err, stdout, stderr) {
                            if (err) throw reject(err);
                            else uninjectResolve();
                        });
                    } else {
                        rm(guildedDir, {force: true, recursive: true}, async (err) => {
                            if (err) throw reject(err);
                            else uninjectResolve();
                        });
                    }
                });

                // Relaunch Guilded
                exec(window.platform.close, () => {
                    exec(window.platform.open(), (openError) => {
                        if (openError)
                            throw reject("E" + openError);
                    });
                });

                resolve();
            } else throw reject("INJECTION_NOT_FOUND");
        });
    });
}