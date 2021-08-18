const { writeFile, access, mkdir } = require("fs");
const { join, sep } = require("path");
const { exec } = require("child_process");

module.exports = async() => {
    // Define Guilded Directory from Global Variable for easy access.
    const guildedDir = window.platformModule.getAppDir();

    // Double Check if ReGuilded is already Injected.
    access(guildedDir, async (err) => {
        if (err) {  // Not Injected
            // Path to the Patcher.
            const patcherPath = join(window.reguildedPath, "scripts/reguildedPatcher.js").replace(RegExp(sep.repeat(2), "g"), "/");

            // Promise so the menu waits.
            await new Promise((resolve, reject) => {

                // Make the Guilded/Resources/App directory.
                mkdir(guildedDir, async (err) => {
                    if (err) throw reject(err);

                    // Create the Index File.
                    else writeFile(join(guildedDir, "index.js"), `require("${patcherPath}");`, async (err) => {
                        if (err) throw reject(err);

                        // Create the Package File.
                        else writeFile(join(guildedDir, "package.json"), JSON.stringify({name: "Guilded", main: "index.js"}), async (err) => {
                            if (err) throw reject(err);
                            else resolve();
                        });
                    });
                });
            });

            // Close Guilded.
            exec(window.platformModule.closeGuilded);
        } else throw new Error("ALREADY_INJECTED");
    })
}