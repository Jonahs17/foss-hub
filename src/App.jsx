// src/App.jsx
import { useState, useEffect } from "react";
import { fetchRepo } from "./api";
import { getCached, setCached } from "./cache";
import "./App.css";

import {
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiGlobe,
  FiWifiOff,
  FiGithub
} from "react-icons/fi";

export default function App() {
  // state
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);
  const [usedCache, setUsedCache] = useState(false);
  const [query, setQuery] = useState("");
  const [licenseFilter, setLicenseFilter] = useState("all");
  const [lang, setLang] = useState("en"); // "en" or "ml"
  const [refreshing, setRefreshing] = useState(false);

  // repo list (Kerala-focused)
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

  // read token from env
  const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || "";

  // small translation map
  const T = {
    en: {
      offlineBanner: "⚠️ Offline Mode — showing cached data where available",
      loading: "Loading repositories...",
      noRepos: "No repos found (check console for errors).",
      viewOnGitHub: "View on GitHub",
      refresh: "Refresh",
      refreshing: "Refreshing...",
      searchPlaceholder: "Search repositories..."
    },
    ml: {
      offlineBanner: "⚠️ ഓഫ്ലൈൻ മോഡ് — ലഭ്യമായ സ്ഥലങ്ങളിൽ കാഷ് ചെയ്ത ഡാറ്റ കാണിക്കുന്നു",
      loading: "റെപ്പോസിറ്ററികൾ ലോഡായി വരികയാണ്...",
      noRepos: "റെപ്പോസ് കണ്ടെത്തിയില്ല (പിശകുകൾക്കായി കോണ്‍സോൾ പരിശോധിക്കുക).",
      viewOnGitHub: "GitHubൽ കാണുക",
      refresh: "പുതുക്കുക",
      refreshing: "പുതുക്കുന്നു...",
      searchPlaceholder: "തിരയുക..."
    }
  };

  // Lightweight network check (github zen)
  async function checkNetwork(token) {
    try {
      const headers = token ? { Authorization: `token ${token}` } : {};
      const resp = await fetch("https://api.github.com/zen", {
        method: "GET",
        headers,
        cache: "no-store"
      });
      return resp.ok;
    } catch (e) {
      return false;
    }
  }

  // keep online state accurate with heartbeat + events
  useEffect(() => {
    let mounted = true;
    let heartbeatTimer = null;

    async function initOnline() {
      // start with navigator value
      setOnline(navigator.onLine);
      // double-check with network ping
      const ok = await checkNetwork(GITHUB_TOKEN);
      if (!mounted) return;
      setOnline(ok);

      // periodic heartbeat (30s)
      heartbeatTimer = setInterval(async () => {
        const ok2 = await checkNetwork(GITHUB_TOKEN);
        if (!mounted) return;
        setOnline(ok2);
      }, 30000);
    }

    function handleOnline() {
      (async () => {
        const ok = await checkNetwork(GITHUB_TOKEN);
        if (mounted) setOnline(ok);
      })();
    }
    function handleOffline() {
      if (mounted) setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    initOnline();

    return () => {
      mounted = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (heartbeatTimer) clearInterval(heartbeatTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // fetch-and-cache routine (used at mount and for manual refresh)
  async function fetchAllAndUpdate() {
    setRefreshing(true);
    setUsedCache(false);
    setLoading(true);
    const final = [];
    for (let [owner, repo] of list) {
      const cacheKey = `${owner}/${repo}`;
      try {
        // try network fetch if we think we're online
        if (navigator.onLine) {
          const data = await fetchRepo(owner, repo, GITHUB_TOKEN);
          final.push(data);
          try {
            await setCached(cacheKey, data);
            // console.log("cached:", cacheKey);
          } catch (e) {
            // ignore cache set errors
            // console.warn("cache set failed", e);
          }
          continue;
        }

        // if offline, fall through to cache logic
        const cached = await getCached(cacheKey);
        if (cached) {
          final.push(cached);
          setUsedCache(true);
          continue;
        }

        // placeholder when nothing is available
        final.push({
          name: `${owner}/${repo}`,
          description: "No network and no cached data available",
          stars: "N/A",
          license: "N/A",
          updated_at: null,
          html_url: `https://github.com/${owner}/${repo}`,
          avatar_url: ""
        });
      } catch (err) {
        // on any fetch error, try cache
        const cached = await getCached(cacheKey);
        if (cached) {
          final.push(cached);
          setUsedCache(true);
        } else {
          final.push({
            name: `${owner}/${repo}`,
            description: "Could not fetch (rate limit or offline); no cache.",
            stars: "N/A",
            license: "N/A",
            updated_at: null,
            html_url: `https://github.com/${owner}/${repo}`,
            avatar_url: ""
          });
        }
      }
    }

    setRepos(final);
    setLoading(false);
    setRefreshing(false);
  }

  // initial load
  useEffect(() => {
    fetchAllAndUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // language toggle
  function handleToggleLang() {
    setLang((s) => (s === "en" ? "ml" : "en"));
  }

  // manual refresh (no reload)
  async function refreshData() {
    await fetchAllAndUpdate();
  }

  // filtered repos for UI
  const filteredRepos = repos.filter((r) => {
    const text = `${r.name || ""} ${r.description || ""}`.toLowerCase();
    const q = query.trim().toLowerCase();
    if (q && !text.includes(q)) return false;
    if (licenseFilter !== "all" && String(r.license) !== licenseFilter) return false;
    return true;
  });

  return (
    <div className="app-container">
      <header className="header-row">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src="/pwa-192.png"
            alt="logo"
            style={{ width: 48, height: 48, borderRadius: 8 }}
          />
          <div>
            <h1 style={{ margin: 0, textAlign: "left" }}>FOSS Hub</h1>
            <small style={{ color: "#666" }}>Offline-first index of open-source projects</small>
          </div>
        </div>

        {/* Refresh on next line */}
        <div style={{ marginTop: 10 }}>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="refresh-btn"
            aria-busy={refreshing}
            aria-label={refreshing ? T[lang].refreshing : T[lang].refresh}
          >
            <FiRefreshCw className={refreshing ? "refresh-rotate" : ""} size={16} />
            {refreshing ? T[lang].refreshing : T[lang].refresh}
          </button>
        </div>
      </header>

      <main style={{ marginTop: 20 }}>
        {/* Controls go here */}
        <div className="controls" role="region" aria-label="controls">
          {/* Search */}
          <div style={{ position: "relative" }}>
            <FiSearch
              className="icon-grey"
              size={16}
              style={{
                position: "absolute",
                top: "50%",
                left: 10,
                transform: "translateY(-50%)",
                opacity: 0.6
              }}
            />
            <input
              className="input"
              placeholder={lang === "ml" ? T.ml.searchPlaceholder : T.en.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: "32px" }}
              aria-label="Search repositories"
            />
          </div>

          {/* License filter */}
          <div style={{ position: "relative" }}>
            <FiFilter
              className="icon-grey"
              size={16}
              style={{
                position: "absolute",
                top: "50%",
                left: 10,
                transform: "translateY(-50%)",
                opacity: 0.6
              }}
            />
            <select
              className="select"
              value={licenseFilter}
              onChange={(e) => setLicenseFilter(e.target.value)}
              style={{ paddingLeft: "32px" }}
              aria-label="Filter by license"
            >
              <option value="all">{lang === "ml" ? "എല്ലാ ലൈസൻസുകളും" : "All licenses"}</option>
              <option value="MIT">MIT</option>
              <option value="GPL-3.0">GPL-3.0</option>
              <option value="Apache-2.0">Apache-2.0</option>
              <option value="Unknown">{lang === "ml" ? "അജ്ഞാതം" : "Unknown"}</option>
            </select>
          </div>

          {/* Language toggle */}
          <button
            className="input"
            onClick={handleToggleLang}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
            aria-pressed={lang === "ml"}
            title={lang === "ml" ? "Switch to English" : "Switch to Malayalam"}
          >
            <FiGlobe size={16} />
            {lang === "ml" ? "English" : "മലയാളം"}
          </button>
        </div>

        {/* Offline banner */}
        {(!online || usedCache) && (
          <div className="banner" style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <FiWifiOff size={18} />
            {lang === "ml" ? T.ml.offlineBanner : T.en.offlineBanner}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <>
            <div className="card">
              <div style={{ width: 56, height: 56, borderRadius: 8 }} className="skeleton" />
              <div style={{ flex: 1 }}>
                <div className="skeleton skel-title" />
                <div className="skeleton skel-text" />
                <div className="skeleton skel-text" style={{ width: "50%" }} />
              </div>
            </div>

            <div className="card">
              <div style={{ width: 56, height: 56, borderRadius: 8 }} className="skeleton" />
              <div style={{ flex: 1 }}>
                <div className="skeleton skel-title" />
                <div className="skeleton skel-text" />
                <div className="skeleton skel-text" style={{ width: "50%" }} />
              </div>
            </div>
          </>
        )}

        {/* No results */}
        {!loading && filteredRepos.length === 0 && (
          <p>{lang === "ml" ? T.ml.noRepos : T.en.noRepos}</p>
        )}

        {/* Repo cards */}
        {!loading &&
          filteredRepos.map((r) => (
            <div key={r.name || r.html_url} className="card" role="article" aria-label={r.name}>
              {r.avatar_url ? (
                <img src={r.avatar_url} alt={`${r.name} avatar`} className="avatar" />
              ) : (
                <div className="avatar" style={{ background: "#f0f0f0" }} />
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{r.name}</h3>
                <p style={{ margin: "6px 0", color: "#333" }}>{r.description}</p>
                <p style={{ margin: 0, color: "#444" }}>
                  ⭐ {r.stars} | License: {r.license}{" "}
                  {r.updated_at ? `| Updated: ${new Date(r.updated_at).toLocaleDateString()}` : null}
                </p>
                <a
                  href={r.html_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8 }}
                >
                  <FiGithub size={16} />
                  {lang === "ml" ? T.ml.viewOnGitHub : T.en.viewOnGitHub}
                </a>
              </div>
            </div>
          ))}
      </main>
    </div>
  );
}
