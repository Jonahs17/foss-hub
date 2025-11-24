import { useState, useEffect } from "react";
import { fetchRepo } from "./api";
import "./App.css";

function App() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  const list = [
    ["opendatakerala", "lsg-kerala-data"],
    ["geohacker", "kerala"],
    ["osmkerala", "District-Maps-Panchayathwise"],
    ["rameshvoltella", "KeralaAICameraTracker"],
    ["karthik324", "Kerala-schools-api"],
    ["opendatakerala", "map.opendatakerala.org"],
    ["osmkerala", "kerala-wards-2024"],
    ["SwathanthraMalayalamComputing", "SMC-fonts"],
    ["opendatakerala", "civil_registrations"],
    ["pucardotorg", "kerala-configs"]
  ];

  // Read token from .env (Vite exposes VITE_ prefixed vars)
  const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || "";

  useEffect(() => {
    let mounted = true;

    async function load() {
      const final = [];
      for (let [owner, repo] of list) {
        try {
          const data = await fetchRepo(owner, repo, GITHUB_TOKEN);
          final.push(data);
        } catch (e) {
          console.log("fetch error for", owner, repo, e);
          // push a fallback object so UI remains consistent
          final.push({
            name: `${owner}/${repo}`,
            description: "Could not fetch data (offline or rate limit).",
            stars: "N/A",
            license: "N/A",
            updated_at: null,
            html_url: `https://github.com/${owner}/${repo}`,
            avatar_url: ""
          });
        }
      }

      if (!mounted) return;
      setRepos(final);
      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, []); // empty deps: run once on mount

  return (
    <div style={{ padding: 20, fontFamily: "Inter, Arial, sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src="/pwa-192.png" alt="logo" style={{ width: 48, height: 48, borderRadius: 8 }} />
        <div>
          <h1 style={{ margin: 0, color: "#006700ff" }}>FOSS Hub</h1>
          <small style={{ color: "#666" }}>Offline-first index of open-source projects</small>
        </div>
      </header>

      <main style={{ marginTop: 20 }}>
        {loading && <p>Loading repositories...</p>}

        {!loading && repos.length === 0 && <p>No repos found (check console for errors).</p>}

        {repos.map((r) => (
          <div
            key={r.name || r.html_url}
            style={{
              border: "3px solid #006700ff",
              padding: 12,
              borderRadius: 8,
              marginBottom: 12,
              display: "flex",
              gap: 12,
              alignItems: "center"
            }}
          >
            {r.avatar_url && <img src={r.avatar_url} alt="" style={{ width: 56, height: 56, borderRadius: 8 }} />}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, color: "#006700ff" }}>{r.name}</h3>
              <p style={{ margin: "6px 0", color: "#333" }}>{r.description}</p>
              <p style={{ margin: 0, color: "#444" }}>
                ⭐ {r.stars} | License: {r.license}{" "}
                {r.updated_at ? `| Updated: ${new Date(r.updated_at).toLocaleDateString()}` : null}
              </p>
              <a href={r.html_url} target="_blank" rel="noreferrer">
                View on GitHub
              </a>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
