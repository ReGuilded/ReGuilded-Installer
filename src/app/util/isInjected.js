const { access } = require("fs");

module.exports = async (platform) => {
    return await new Promise((resolve) => {
        access(platform.appDir, (err) => {
            resolve(!err);
        });
    });
}