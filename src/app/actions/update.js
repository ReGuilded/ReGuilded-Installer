// Custom Modules
const { isInjected } = require("../util");

// NPM Modules
const { createWriteStream } = require("fs-extra");
const { stream } = require("got");
const { join } = require("path");

module.exports = () => {
    return new Promise((resolve, reject) => {
        process.noAsar = true;
        const downloadUrl = window.gitRelease.downloadUrl
        const downloadPath = join(window.platform.reguildedDir, "reguilded.asar");

        try {
            stream(downloadUrl)
                .pipe(createWriteStream(downloadPath))
                .on("finish", async () => {
                    process.noAsar = false;
                    resolve(["update", await isInjected() ? "uninject" : "inject"])
                });
        } catch (err) {
            process.noAsar = false;
            reject(err);
        }
    });
}