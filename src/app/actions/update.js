module.exports = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(["update", "inject"]);
        }, 2000)
    });
}