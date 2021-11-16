// Custom Modules
const gitHandler = require("../util").gitHandler;

// NPM Modules
const { Extract } = require("unzipper");
const { copy } = require("fs-extra");
const { stream } = require("got");
const { join } = require("path");
const fs = require("fs");

module.exports = async (devBuild) => {

    const commit = gitHandler.getCommit(devBuild);

    const reguildedDir = join(process.env.APPDATA ?? process.env.HOME, ".reguilded");
    const zipPath = reguildedDir + ".zip";

    // Download Commit Zip.
    await new Promise((resolve, reject) => {
        stream(commit.zipUrl)
            .pipe(fs.createWriteStream(zipPath))
            .on("finish", function() {
                fs.createReadStream(zipPath)
                    .pipe(Extract({ path: reguildedDir })).on("close", function () {
                    fs.unlink(zipPath, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            });
    });

    // Move downloaded files into `~/.reguilded` and then delete the old folder.
    await new Promise((resolve, reject) => {
        fs.readdir(reguildedDir, {withFileTypes: true}, (err, files) => {
           const dirs = files.filter(file => file.isDirectory());
           const gitDir = join(reguildedDir, dirs[0].name);
           const appDir = join(gitDir, "src/app");

           copy(appDir, reguildedDir, { recursive: true, errorOnExist: false, overwrite: true}, (err) => {
               if (err) throw err;
               else {
                    fs.rmdir(gitDir, {recursive: true}, (err) => {
                        if (err) reject(err);
                        else resolve();
                    })
               }
           })
        });
    });

    // Create new `.sha` file inside `~/.reguilded` that has the commitSha used for checking latest version.
    await new Promise((resolve, reject) => {
        fs.writeFile(join(reguildedDir, ".sha"), commit.commitSha, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}