// Custom Modules
const { isInjected } = require("../util");

const { access, rm, rename} = require("fs");
const sudo = require("sudo-prompt");
const { join } = require("path");

module.exports = () => {
    return new Promise((resolve, reject) => {
        access(window.platform.appDir, async (error) => {
            if (!error) {
                process.noAsar = true
                const guildedMoveToPath = join(window.platform.resourcesDir, "_guilded");

                new Promise((uninjectResolve) => {
                    // Removes the Guilded/Resources/App directory.
                    // Elevate for Linux and run Terminal Commands
                    // Or use FS for Windows & Mac
                    if (["linux"].includes(process.platform)) {
                        const command = `rm -rf ${JSON.stringify(window.platform.appDir)} && ` +
                            `mv -f ${JSON.stringify(join(guildedMoveToPath, "app.asar"))} ${JSON.stringify(join(window.platform.resourcesDir, "app.asar"))} && ` +
                            `mv -f ${JSON.stringify(join(guildedMoveToPath, "app.asar.unpacked"))} ${JSON.stringify(join(window.platform.resourcesDir, "app.asar.unpacked"))} && ` +
                            `rm -rf ${JSON.stringify(guildedMoveToPath)}`

                        sudo.exec(command, {name: "ReGuilded Installer"}, async (err, stdout, stderr) => {
                            if (err) { reject(err); return; }
                            if (stderr) { reject(stderr); return; }

                            uninjectResolve();
                        });
                    } else if (["win32", "darwin"].includes(process.platform)) {
                        Promise.all([
                            new Promise((reguildedAppDirResolve) => {
                                rm(window.platform.appDir, {force: true, recursive: true}, async (rmErr) => {
                                    if (rmErr) {
                                        reject(rmErr);
                                        return;
                                    }

                                    reguildedAppDirResolve();
                                });
                            }),

                            new Promise((guildedMoveResolve) => {
                                rename(join(guildedMoveToPath, "app.asar"), join(window.platform.resourcesDir, "app.asar"), (asarRenameErr) => {
                                    if (asarRenameErr) {
                                        reject(asarRenameErr);
                                        return;
                                    }

                                    rename(join(guildedMoveToPath, "app.asar.unpacked"), join(window.platform.resourcesDir, "app.asar.unpacked"), (asarUnpackedRenameErr) => {
                                        if (asarUnpackedRenameErr) {
                                            reject(asarUnpackedRenameErr);
                                            return;
                                        }


                                        rm(guildedMoveToPath, {force: true, recursive: true}, async (rmErr) => {
                                            if (rmErr) {
                                                reject(rmErr);
                                                return;
                                            }

                                            guildedMoveResolve();
                                        });
                                    });
                                });
                            })
                        ]).then(uninjectResolve)
                    }
                }).then(async () => {
                    // Even though Uninject should be successful at this point
                    // double check to make sure, before displaying options back to the user.
                    resolve(["update", await isInjected() ? "uninject" : "inject"]);
                });

            } else reject(new Error("ReGuilded is not injected."))
        });
    });
}