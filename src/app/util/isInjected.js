const { access } = require("fs");

module.exports = async(platformModule) => {
    return await new Promise((resolve) => {
        access(platformModule.getAppDir(), (err) => {
            resolve(!err);
        });
    });
}