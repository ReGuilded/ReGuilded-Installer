module.exports = () => {
    let platformModule;
    try {
        platformModule = require(`./platformModules/${process.platform}.js`);

        return [platformModule, null];
    } catch (err) {
        console.error(err);
        return [null, "UNSUPPORTED_PLATFORM"];
    }
}