// GET /api/brand  ->  a tiny script, loaded in <head>, that applies this site's
// brand (colors, theme, names, icons) before the page draws.
const { currentBrand } = require("./_brands");

module.exports = (req, res) => {
  const b = currentBrand();
  const js = `(function(){
  var B = window.BRAND = ${JSON.stringify(b)};
  var d = document.documentElement, st = d.style;
  d.setAttribute("data-theme", B.theme);
  st.setProperty("--amber", B.accent);
  st.setProperty("--amber-hover", B.accentHover);
  st.setProperty("--on-accent", B.onAccent);
  st.setProperty("--accent-rgb", B.accentRgb);
  document.title = B.name;
  function link(rel, href){ var l = document.querySelector('link[rel="' + rel + '"]'); if (!l){ l = document.createElement("link"); l.rel = rel; document.head.appendChild(l); } l.href = href; }
  function meta(name, val){ var m = document.querySelector('meta[name="' + name + '"]'); if (!m){ m = document.createElement("meta"); m.name = name; document.head.appendChild(m); } m.content = val; }
  link("icon", B.icons.favicon); link("apple-touch-icon", B.icons.i192);
  meta("theme-color", B.background); meta("apple-mobile-web-app-title", B.short);
  if (B.theme === "light") meta("apple-mobile-web-app-status-bar-style", "default");
})();`;
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(js);
};
