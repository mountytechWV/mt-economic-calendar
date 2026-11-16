// GET /api/fedcal?ym=2026-11
// Reads the Federal Reserve Board's public monthly calendar
// (federalreserve.gov/newsevents/2026-November.htm) and returns the speeches and
// discussions by Board members (Chair, Vice Chairs, Governors), with the
// "Watch Live" link when the Fed lists one. Cached for 30 minutes at the CDN.
// Regional Fed presidents are not on this calendar.

const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

const ENT = { "&amp;": "&", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&nbsp;": " ", "&rsquo;": "’", "&lsquo;": "‘", "&ldquo;": "“", "&rdquo;": "”", "&ndash;": "–", "&mdash;": "—" };
const decode = s => s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&[a-z#0-9]+;/gi, m => ENT[m.toLowerCase()] ?? m);

function parse(html) {
  // keep only the Speeches section when we can find it
  const start = html.search(/>\s*Speeches\s*</i);
  const end = start >= 0 ? html.slice(start).search(/>\s*FOMC Meetings\s*</i) : -1;
  let part = start >= 0 ? html.slice(start, end > 0 ? start + end : undefined) : html;
  part = part
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "")
    // any link whose visible text says Watch Live / Webcast / Livestream, however it's marked up
    .replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (m, attrs, inner) => {
      const text = decode(inner.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
      const label = text + " " + (attrs.match(/(?:title|aria-label)\s*=\s*(["'])(.*?)\1/i) || [])[2];
      if (!/watch\s*live|webcast|live\s*stream|livestream/i.test(label)) return m;
      const hm = attrs.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      let href = hm ? (hm[1] || hm[2] || hm[3] || "") : "";
      if (href.startsWith("/")) href = "https://www.federalreserve.gov" + href;
      return href ? `\n[[WATCH:${href}]]\n` : "\n";
    })
    .replace(/<[^>]+>/g, "\n");
  const lines = decode(part).split(/\n+/).map(l => l.replace(/\s+/g, " ").trim()).filter(Boolean);

  const TIME = /^\d{1,2}:\d{2}\s*[ap]\.?m\.?$/i;
  const WHO = /^(.{3,60}?)\s+[-–]\s+((?:Chair(?:man|woman)?|Vice Chair(?:man|woman)?(?: for Supervision)?|Governor)\s+.+)$/i;
  const out = [];
  let cur = null;
  lines.forEach((ln, i) => {
    const who = ln.match(WHO);
    if (who) {
      const name = who[2].replace(/^(Chair(?:man|woman)?|Vice Chair(?:man|woman)?(?: for Supervision)?|Governor)\s+/i, "").trim();
      const last = name.replace(/,?\s+(Jr|Sr|II|III)\.?$/i, "").split(" ").pop();
      cur = { type: who[1].trim(), speaker: who[2].trim(), last, time: TIME.test(lines[i - 1] || "") ? lines[i - 1] : "", watch: "", title: "", where: "", day: null };
      out.push(cur);
      return;
    }
    if (!cur || cur.day) return;
    const w = ln.match(/^\[\[WATCH:(.+)\]\]$/);
    if (w) { if (/^https?:\/\//i.test(w[1])) cur.watch = decode(w[1]); return; }
    if (/^(watch\s*live|webcast|live\s*stream|livestream)$/i.test(ln)) return;   // never use the link text as a title
    if (/^\d{1,2}$/.test(ln)) { cur.day = +ln; return; }
    if (/^At\s/i.test(ln)) { cur.where = ln; return; }
    if (!cur.title && !TIME.test(ln)) cur.title = ln;
  });
  return out.filter(e => e.day);
}

module.exports = async (req, res) => {
  const m = String(req.query.ym || "").match(/^(\d{4})-(\d{1,2})$/);
  if (!m || +m[2] < 1 || +m[2] > 12) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(400).json({ ok: false, error: "Use ym=YYYY-MM" });
  }
  const url = `https://www.federalreserve.gov/newsevents/${m[1]}-${MONTHS[+m[2] - 1]}.htm`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": "MT-Economic-Calendar (+https://github.com/mountytechWV)" } });
    if (!r.ok) throw new Error(`Fed calendar returned HTTP ${r.status}`);
    const html = await r.text();
    const events = parse(html);
    if (req.query.debug) {   // /api/fedcal?ym=2026-11&debug=1 shows the raw markup around the first "Watch Live"
      const i = html.search(/watch\s*live/i);
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ ok: true, source: url, events, sample: i >= 0 ? html.slice(Math.max(0, i - 500), i + 200) : null });
    }
    res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=7200");
    res.status(200).json({ ok: true, source: url, events });
  } catch (err) {
    res.setHeader("Cache-Control", "public, s-maxage=120");
    res.status(502).json({ ok: false, source: url, error: String(err.message || err), events: [] });
  }
};

module.exports.parse = parse; // for tests
