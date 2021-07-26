const { writeFile, access, mkdir } = require("fs");
const { join, sep } = require("path");
const { exec } = require("child_process");

module.exports = async() => {
    // Define Guilded Directory from Global Variable for easy access.
    const guildedDir = window.platformModule.getAppDir();

    access(guildedDir, async (err) => {
        if (err) {  // Not Injected
            const patcherPath = join(window.reguildedPath, "scripts/reguildedPatcher.js").replace(RegExp(sep.repeat(2), "g"), "/");

            try {
                mkdir(guildedDir, async(err) => {
                    if (err) throw err;
                });

                writeFile(join(guildedDir, "index.js"), `require("${patcherPath}");`, async (err) => {
                    if (err) throw err;
                });
                writeFile(join(guildedDir, "package.json"), JSON.stringify({name: "Guilded", main: "index.js"}), async (err) => {
                    if (err) throw err;
                });

                exec(window.platformModule.closeGuilded);
            } catch (err) {
                throw err;
            }
        } else throw new Error("ALREADY_INJECTED");
    })
}