module.exports = () => {
    return new Promise((resolve) => {
        fetch("https://api.github.com/repos/ItzNxthaniel/ReGuilded/releases/latest").then((response) => {
            if (response.ok) {
                response.json().then((json) => {
                    if (json.assets.length !== 0) {
                        resolve({
                            downloadUrl: json.assets.find(x => x.name === "reguilded.asar").browser_download_url,
                            versionString: json.tag_name,
                            browserUrl: json.html_url,
                        })
                    }
                });
            } else resolve(undefined)
        });
    })
}