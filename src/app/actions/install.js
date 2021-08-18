const { Octokit } = require("@octokit/core");
const { join, dirname } = require("path");
const { Extract } = require("unzipper");
const { copy } = require("fs-extra");
const { stream } = require("got");
const fs = require("fs");

module.exports = async (devBuild) => {
    const octokit = new Octokit();
    let zipUrl, commitSha;

    if (!devBuild) {    // Latest Release
        const latestRelease = await octokit.request("GET /repos/{owner}/{repo}/releases/latest", {
            owner: "ReGuilded",
            repo: "ReGuilded"
        });
        const tagName = latestRelease.data.tag_name;

        const repoTags = await octokit.request("GET /repos/{owner}/{repo}/tags", {
            owner: "ReGuilded",
            repo: "ReGuilded"
        })
        const tagForRelease = repoTags.data.find(object => object.name === tagName);

        commitSha = tagForRelease.commit.sha;
        zipUrl = latestRelease.data.zipball_url;
    } else {    // Latest Commit
        const repoCommits = await octokit.request("GET /repos/{owner}/{repo}/commits", {
            owner: "ReGuilded",
            repo: "ReGuilded"
        });
        const latestCommit = repoCommits.data[0];

        // Set Commit Sha & Download URL.
        commitSha = latestCommit.sha;
        zipUrl = `https://api.github.com/repos/ReGuilded/ReGuilded/zipball/${commitSha}`;
    }
    const reguildedDir = join(process.env.APPDATA ?? process.env.HOME, ".reguilded");
    const zipPath = reguildedDir + ".zip";

    // Download Commit Zip.
    await new Promise((resolve, reject) => {
        stream(zipUrl)
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

    // Move downloaded files into `~/.reguilded` and then delete the old folder. (REPLACE WITH IGNORANCE)
    // Ignore Folders:  /inject/, /logo/
    // Ignore Files:    .gitignore, LICENSE, package.json, package-lock.json, README.md, SECURITY.md
    await new Promise((resolve, reject) => {
        fs.readdir(reguildedDir, {withFileTypes: true}, (err, files) => {
           const dirs = files.filter(file => file.isDirectory());
           const dir = join(reguildedDir, dirs[0].name);

           copy(dir, reguildedDir, { recursive: true, errorOnExist: false, overwrite: true}, (err) => {
               if (err) throw err;
               else {
                    fs.rmdir(dir, {recursive: true}, (err) => {
                        if (err) reject(err);
                        else resolve();
                    })
               }
           })
        });
    });

    // Create new `.sha` file inside `~/.reguilded` that has the commitSha used for checking latest version.
    await new Promise((resolve, reject) => {
        fs.writeFile(join(reguildedDir, ".sha"), commitSha, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}