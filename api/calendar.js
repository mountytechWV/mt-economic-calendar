// GET /api/calendar
// Relays Fair Economy's public weekly calendar feed (the feed behind Forex Factory's
// calendar export) so the browser can read it. Vercel's CDN caches the response for
// 10 minutes, so the upstream feed is hit rarely no matter how many people use the site.

const FEED_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";
let warm = null; // survives between calls while this function instance stays warm

// Forex Factory and Investing.com don't always agree on how big an event is. The main
// screen is the Investing.com calendar, so these overrides bring the feed's impact up to
// match it (alerts, ticker, "next high impact" and auto-alerts all read this field).
// Investing.com 3 bulls = High, 2 bulls = Medium. Overrides only ever RAISE an event:
// if Forex Factory already rates it the same or higher, its rating is kept.
// Key: "COUNTRY|exact Forex Factory event title" -> impact.
// Fed speeches are left alone: Investing.com rates them speaker by speaker.
const IMPACT_OVERRIDES = {
  // Investing.com: 3 bulls
  "USD|Crude Oil Inventories": "High",
  "USD|Philly Fed Manufacturing Index": "High",
  "USD|Unemployment Claims": "High",
  // Investing.com: 2 bulls
  "USD|Empire State Manufacturing Index": "Medium",
  "USD|ADP Weekly Employment Change": "Medium",
  "USD|Import Prices m/m": "Medium",
  "USD|Industrial Production m/m": "Medium",
  "USD|Business Inventories m/m": "Medium",
  "USD|API Weekly Statistical Bulletin": "Medium",
  "USD|Building Permits": "Medium",
  "USD|Housing Starts": "Medium",
  "USD|Pending Home Sales m/m": "Medium",
  "USD|TIC Long-Term Purchases": "Medium",
  "USD|CB Leading Index m/m": "Medium",
};
const RANK = { Holiday: 0, Low: 1, Medium: 2, High: 3 };
const impactFor = e => {
  const ff = e.impact || "";
  const o = IMPACT_OVERRIDES[`${e.country}|${e.title}`];
  return o && (RANK[o] || 0) > (RANK[ff] || 0) ? o : ff;
};

const pick = e => ({
  title: e.title || "",
  country: e.country || "",
  date: e.date || "",
  impact: impactFor(e),
  forecast: e.forecast || "",
  previous: e.previous || "",
  actual: e.actual || "",
});

module.exports = async (req, res) => {
  try {
    if (!warm || Date.now() - warm.t > 5 * 60e3) {
      const r = await fetch(FEED_URL, {
        headers: { "User-Agent": "MT-Economic-Calendar (+https://github.com/mountytechWV)", Accept: "application/json" },
      });
      if (!r.ok) throw new Error(`Calendar feed returned HTTP ${r.status}`);
      const data = await r.json();
      if (!Array.isArray(data)) throw new Error("Unexpected calendar feed format");
      warm = { t: Date.now(), events: data.map(pick) };
    }
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
    res.status(200).json({ events: warm.events, fetched_at: warm.t / 1000, status: "live", error: null });
  } catch (err) {
    if (warm) {
      res.setHeader("Cache-Control", "public, s-maxage=60");
      return res.status(200).json({ events: warm.events, fetched_at: warm.t / 1000, status: "stale", error: String(err.message || err) });
    }
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ events: [], fetched_at: null, status: "offline", error: String(err.message || err) });
  }
};
