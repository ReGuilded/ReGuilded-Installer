// Custom Modules
const gitHandler = require("../util").gitHandler;

// NPM Modules
const { Extract } = require("unzipper");
const { copy } = require("fs-extra");
const { stream } = require("got");
const { join } = require("path");
const fs = require("fs");

module.exports = async (devBuild) => {
    return new Promise(async (resolve, reject) => {
        const commit = gitHandler.getCommit(devBuild);
        const reguildedDir = join(process.env.APPDATA ?? process.env.HOME, ".reguilded");
        const zipPath = reguildedDir + ".zip";

        // Download Zip & Extract Zip
        await new Promise((zipResolve) => {
            stream(commit.zipUrl)
                .pipe(fs.createWriteStream(zipPath))
                .on("finish", function() {
                    fs.createReadStream(zipPath)
                        .pipe(Extract({ path: reguildedDir })).on("close", function () {
                            fs.unlink(zipPath, (err) => {
                                if (err) reject(err);
                                else zipResolve();
                            });
                        });
                });
        });

        // Move downloaded files into `~/.reguilded` and then delete the old folder.
        await new Promise((moveResolve) => {
            fs.readdir(reguildedDir, {withFileTypes: true}, (err, files) => {
                const dirs = files.filter(file => file.isDirectory());
                const gitDir = join(reguildedDir, dirs[0].name);
                const appDir = join(gitDir, "src/app");

                copy(appDir, reguildedDir, { recursive: true, errorOnExist: false, overwrite: true}, (err) => {
                    if (err) throw err;
                    else {
                        fs.rmdir(gitDir, {recursive: true}, (err) => {
                            if (err) reject(err);
                            else moveResolve();
                        })
                    }
                })
            });
        });

        // Create new `.sha` file inside `~/.reguilded` that has the commitSha used for checking latest version.
        await new Promise((shaResolve) => {
            fs.writeFile(join(reguildedDir, ".sha"), commit.commitSha, (err) => {
                if (err) reject(err);
                else shaResolve();
            });
        })

        resolve();
    });
}