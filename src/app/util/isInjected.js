const { access } = require("fs");

module.exports = async () => {
    return await new Promise((resolve) => {
        access(window.platform.appDir, (err) => {
            resolve(!err);
        });
    });
}