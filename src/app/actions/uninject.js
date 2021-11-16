const { access, rm } = require("fs");
const { exec } = require("child_process");

module.exports = async() => {
    // Define Guilded Directory from Global Variable for easy access.
    const guildedDir = window.platform.dir;

    // Double Check if ReGuilded is injected.
    access(guildedDir, async(err) => {
        if (!err) { // Is Injected

            // Promise so the menu waits.
            await new Promise((resolve, reject) => {

                // Removes the Guilded/Resources/App directory.
                rm(guildedDir, {force: true, recursive: true}, async (err) => {
                    if (err) throw reject(err);
                    else resolve();
                })
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