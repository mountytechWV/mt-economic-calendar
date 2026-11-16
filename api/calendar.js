// GET /api/calendar
// Relays Fair Economy's public weekly calendar feed (the feed behind Forex Factory's
// calendar export) so the browser can read it. Vercel's CDN caches the response for
// 10 minutes, so the upstream feed is hit rarely no matter how many people use the site.

const FEED_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";
let warm = null; // survives between calls while this function instance stays warm

const pick = e => ({
  title: e.title || "",
  country: e.country || "",
  date: e.date || "",
  impact: e.impact || "",
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
