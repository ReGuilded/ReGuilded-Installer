// Custom Modules
const { isInjected } = require("../util")

// NPM Modules
const { createWriteStream } = require("fs-extra");
const sudo = require("sudo-prompt");
const { stream } = require("got");
const { join } = require("path");

module.exports = () => {
    return new Promise(async (resolve, reject) => {
        process.noAsar = true;
        const downloadUrl = window.gitRelease.downloadUrl
        const downloadPath = join(__dirname, "reguilded.asar");

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

// module.exports = async (devBuild) => {
//     return new Promise(async (resolve, reject) => {
//         const commit = gitHandler.getCommit(devBuild);
//         const reguildedDir = join(process.env.APPDATA ?? process.env.HOME, ".reguilded");
//         const zipPath = reguildedDir + ".zip";
//
//         // Download Zip & Extract Zip
//         await new Promise((zipResolve) => {
//             stream(commit.zipUrl)
//                 .pipe(fs.createWriteStream(zipPath))
//                 .on("finish", function() {
//                     fs.createReadStream(zipPath)
//                         .pipe(Extract({ path: reguildedDir })).on("close", function () {
//                             fs.unlink(zipPath, (err) => {
//                                 if (err) reject(err);
//                                 else zipResolve();
//                             });
//                         });
//                 });
//         });
//
//         // Move downloaded files into `~/.reguilded` and then delete the old folder.
//         await new Promise((moveResolve) => {
//             fs.readdir(reguildedDir, {withFileTypes: true}, (err, files) => {
//                 const dirs = files.filter(file => file.isDirectory());
//                 const gitDir = join(reguildedDir, dirs[0].name);
//                 const appDir = join(gitDir, "src/app");
//
//                 copy(appDir, reguildedDir, { recursive: true, errorOnExist: false, overwrite: true}, (err) => {
//                     if (err) throw err;
//                     else {
//                         fs.rmdir(gitDir, {recursive: true}, (err) => {
//                             if (err) reject(err);
//                             else moveResolve();
//                         })
//                     }
//                 })
//             });
//         });
//
//         // Create new `.sha` file inside `~/.reguilded` that has the commitSha used for checking latest version.
//         await new Promise((shaResolve) => {
//             fs.writeFile(join(reguildedDir, ".sha"), commit.commitSha, (err) => {
//                 if (err) reject(err);
//                 else shaResolve();
//             });
//         })
//
//         resolve();
//     });
// }