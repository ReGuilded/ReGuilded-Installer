const { access, rm } = require("fs");
const { exec } = require("child_process");

module.exports = async() => {
    // Define Guilded Directory from Global Variable for easy access.
    const guildedDir = window.platformModule.getAppDir();

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

            exec(window.platformModule.closeGuilded);
        } else throw new Error("INJECTION_NOT_FOUND");
    })
}