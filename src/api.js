import axios from "axios";

const DEFAULT_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || "";

export async function fetchRepo(owner, repo,token) {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    const headers = token ? {Authorization: `token ${token}`} : {};
    const res = await axios.get(url, {headers});
    return {
        name: res.data.full_name,
        description: res.data.description,
        stars: res.data.stargazers_count,
        license: res.data.license ? res.data.license.spdx_id : "Unknown",
        updated_at:res.data.pushed_at,
        html_url: res.data.html_url,
        avatar_url: res.data.owner?.avatar_url
    };
}