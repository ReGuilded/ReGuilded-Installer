const { Octokit } = require("@octokit/core");
const octokit = new Octokit();

module.exports = {
    latestRelease: {
        commit: null,
        commitSha: null,
        zipUrl: null,
        release: null,

        async populate() {
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

            this.release = latestRelease.data;
            this.commit = tagForRelease.commit;
            this.commitSha = this.commit.sha;
            this.zipUrl = latestRelease.data.zipball_url;
        }
    },
    latestCommit: {
        commit: null,
        commitSha: null,
        zipUrl: null,

        async populate() {
            const repoBranches = await octokit.request("GET /repos/{owner}/{repo}/branches/{branch}", {
                owner: "ReGuilded",
                repo: "ReGuilded",
                branch: "main"
            });

            const repoBranch = repoBranches.data;

            this.commit = repoBranch.commit;
            this.commitSha = this.commit.sha;
            this.zipUrl = `https://api.github.com/repos/ReGuilded/ReGuilded/zipball/${this.commitSha}`;
        }
    },
    getCommit(devBuild) {
        switch (devBuild) {
            case true:
                return this.latestCommit
            case false:
                return this.latestRelease
        }
    }
}
