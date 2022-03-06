// Custom Modules
const { isInjected } = require("../util");

// NPM Modules
const { writeFile, access, mkdir, rename } = require("fs");
const { join, sep } = require("path");
const sudo = require("sudo-prompt");

module.exports = () => {
    return new Promise((resolve, reject) => {
        access(window.platform.appDir, async (error) => {
            if (error) {
                process.noAsar = true
                const reguildedAsarPath = join(window.platform.reguildedDir, "reguilded.asar").replace(RegExp(sep.repeat(2), "g"), "/");
                const guildedMoveToPath = join(window.platform.resourcesDir, "_guilded");

                // Handles Injection
                // Elevate for Linux (if not root) and run Terminal Commands
                // Or use FS for Windows & Mac
                try {
                    if (["linux"].includes(process.platform)) {
                        const command = `mkdir ${JSON.stringify(window.platform.appDir)} && ` +
                            `echo '{"name": "Guilded", "main": "index.js"}' | tee -a ${JSON.stringify(join(window.platform.appDir, "package.json"))} > /dev/null && ` +
                            `echo 'require(${JSON.stringify(reguildedAsarPath)});' | tee -a ${JSON.stringify(join(window.platform.appDir, "index.js"))} > /dev/null && ` +
                            `mkdir ${JSON.stringify(guildedMoveToPath)} && ` +
                            `mv -f ${JSON.stringify(join(window.platform.resourcesDir, "app.asar"))} ${JSON.stringify(join(guildedMoveToPath, "app.asar"))} && ` +
                            `mv -f ${JSON.stringify(join(window.platform.resourcesDir, "app.asar.unpacked"))} ${JSON.stringify(join(guildedMoveToPath, "app.asar.unpacked"))}`

                        sudo.exec(command, {name: "ReGuilded Installer"}, async (err, stdout, stderr) => {
                            if (err) { reject(err); return; }
                            if (stderr) { reject(stderr); return; }

                            // Even though this is still a return if inject is successful,
                            // a double check to make sure that ReGuilded is indeed injected.
                            resolve(["update", await isInjected() ? "uninject" : "inject"]);
                        });
                    } else {
                        await new Promise((reguildedAppDirResolve) => {
                            mkdir(window.platform.appDir, (mkDirErr) => {
                                if (mkDirErr) { reject(mkDirErr);  return; }

                                writeFile(join(window.platform.appDir, "index.js"), `require(${JSON.stringify(reguildedAsarPath)});`, (jsWriteErr) => {
                                    if (jsWriteErr) { reject(jsWriteErr); return; }

                                    writeFile(join(window.platform.appDir, "package.json"), JSON.stringify({ name: "Guilded", main: "index.js" }), (jsonWriteErr) => {
                                        if (jsonWriteErr) { reject(jsonWriteErr); return; }

                                        reguildedAppDirResolve();
                                    });
                                });
                            });
                        });

                        await new Promise((guildedMoveResolve) => {
                            mkdir(guildedMoveToPath, (mkDirErr) => {
                                if (mkDirErr) { reject(mkDirErr); return; }

                                rename(join(window.platform.resourcesDir, "app.asar"), join(guildedMoveToPath, "app.asar"), (asarRenameErr) => {
                                    if (asarRenameErr) { reject(asarRenameErr); return; }

                                    rename(join(window.platform.resourcesDir, "app.asar.unpacked"), join(guildedMoveToPath, "app.asar.unpacked"), (asarUnpackedRenameErr) => {
                                        if (asarUnpackedRenameErr) { reject(asarUnpackedRenameErr); return; }

                                        guildedMoveResolve();
                                    });
                                });
                            });
                        });

                        // Even though this is still a return if inject is successful,
                        // a double check to make sure that ReGuilded is indeed injected.
                        resolve(["update", await isInjected() ? "uninject" : "inject"]);
                    }
                } catch (err) {
                    reject(err);
                }
            } else reject(new Error("ReGuilded is already injected."))
        });
    });
}

// module.exports = () => {
//     return new Promise((resolve, reject) => {
//         // Define Guilded Directory from Global Variable for easy access.
//         const guildedDir = window.platform.dir;
//
//         // Double Check if ReGuilded is already Injected.
//         access(guildedDir, async (err) => {
//             if (err) {  // Not Injected
//                 // Path to the Patcher.
//                 const patcherPath = join(window.reguildedPath, "scripts/reguildedPatcher.js").replace(RegExp(sep.repeat(2), "g"), "/");
//
//                 // Makes the Guilded/Resources/App directory.
//                 // Elevate for Linux and run Terminal Commands
//                 // Or use FS for Windows & Mac
//                 if (process.platform === "linux" && process.getuid() !== 0) {
//                     const command = `mkdir ${guildedDir} && echo '{"name": "Guilded", "main": "index.js"}' | tee -a ${join(guildedDir, "package.json")} > /dev/null &&` +
//                         `echo 'require("${patcherPath}")' | tee -a ${join(guildedDir, "index.js")} > /dev/null`
//                     sudo.exec(command, {name: "ReGuilded Installer"}, function(err, stdout, stderr) {
//                         if (err) throw reject(err);
//                         else resolve();
//                     });
//                 } else {
//                     mkdir(guildedDir, async (err) => {
//                         if (err) throw reject(err);
//
//                         // Create the Index File.
//                         else writeFile(join(guildedDir, "index.js"), `require("${patcherPath}");`, async (err) => {
//                             if (err) throw reject(err);
//
//                             // Create the Package File.
//                             else writeFile(join(guildedDir, "package.json"), JSON.stringify({name: "Guilded", main: "index.js"}), async (err) => {
//                                 if (err) throw reject(err);
//                                 else resolve();
//                             });
//                         });
//                     });
//                 }
//
//                 // Relaunch Guilded
//                 exec(window.platform.close, () => {
//                     exec(window.platform.open(), (openError) => {
//                         if (openError)
//                             throw new Error("E" + openError);
//                     })
//                 })
//             } else throw reject("ALREADY_INJECTED");
//         });
//     });
// };