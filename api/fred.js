// GET /api/fred?s=SERIES&u=UNITS
// Fetches recent observations for one FRED series using the site owner's key
// (Vercel environment variable FRED_API_KEY), so visitors never need a key and
// never see it. Only the series the app actually uses are allowed, and Vercel's CDN
// caches each answer for 60 seconds, so FRED gets at most about one request per
// series per minute however many people have the page open.
//
// This product uses the FRED(R) API but is not endorsed or certified by the
// Federal Reserve Bank of St. Louis.

const ALLOWED = new Set([
  // keep in sync with the `f.s` values in public/indicators.js
  "A191RL1Q225SBEA", "ADXTNO", "BOPGSTB", "BUSINV", "CCSA", "CES0500000003", "CPIAUCNS",
  "CPIAUCSL", "CPILFENS", "CPILFESL", "DGORDER", "GACDFSA066MSFRBPHI", "GACDISA066MSFRBNY",
  "HOUST", "HSN1F", "ICSA", "INDPRO", "IR", "JTSJOL", "PAYEMS", "PCE", "PCEPI", "PCEPILFE",
  "PERMIT", "PI", "PPIFES", "PPIFIS", "RSAFS", "RSFSXMV", "TCU", "UNRATE",
]);
const UNITS = new Set(["lin", "chg", "pch", "pc1"]);
const API = "https://api.stlouisfed.org/fred/";

// "2026-11-16 07:32:15-06" -> epoch seconds
function fredTime(stamp) {
  if (!stamp) return null;
  let s = String(stamp).trim().replace(" ", "T");
  if (/[+-]\d\d$/.test(s)) s += ":00";
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : t / 1000;
}

async function get(endpoint, params, key) {
  const q = new URLSearchParams({ ...params, api_key: key, file_type: "json" });
  const r = await fetch(`${API}${endpoint}?${q}`, { headers: { "User-Agent": "MT-Economic-Calendar" } });
  if (!r.ok) {
    let msg = `FRED returned HTTP ${r.status}`;
    try { msg = (await r.json()).error_message || msg; } catch (_) {}
    throw new Error(msg);
  }
  return r.json();
}

module.exports = async (req, res) => {
  const s = String(req.query.s || "");
  const u = String(req.query.u || "lin");
  if (!ALLOWED.has(s) || !UNITS.has(u)) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(400).json({ ok: false, error: "Series not available" });
  }
  const key = process.env.FRED_API_KEY;
  if (!key) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(500).json({ ok: false, error: "FRED is not set up on this site yet" });
  }
  try {
    const [meta, data] = await Promise.all([
      get("series", { series_id: s }, key),
      get("series/observations", { series_id: s, units: u, sort_order: "desc", limit: "30" }, key),
    ]);
    const info = (meta.seriess || [])[0] || {};
    const obs = (data.observations || [])
      .filter(o => o.value !== undefined && o.value !== ".")
      .map(o => ({ date: o.date, value: o.value }));
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({
      ok: true, obs, updated: fredTime(info.last_updated),
      title: info.title || "", frequency: info.frequency_short || "",
    });
  } catch (err) {
    res.setHeader("Cache-Control", "public, s-maxage=30");
    res.status(502).json({ ok: false, error: String(err.message || err) });
  }
};
