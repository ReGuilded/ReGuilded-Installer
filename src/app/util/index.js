module.exports = {
    get platform() { return require("./platform") },
    get gitHandler() { return require("./gitHandler") },
    get isInjected() { return require("./isInjected") }
}