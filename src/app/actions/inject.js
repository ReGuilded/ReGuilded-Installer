const { writeFile, access, mkdir } = require("fs");
const { exec } = require("child_process");
const { join, sep } = require("path");
const sudo = require("sudo-prompt");

module.exports = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(["update", "uninject"]);
        }, 2000)
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