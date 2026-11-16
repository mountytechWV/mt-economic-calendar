// GET /api/manifest  ->  home-screen app settings for this site's brand
const { currentBrand } = require("./_brands");

module.exports = (req, res) => {
  const b = currentBrand();
  res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(JSON.stringify({
    name: b.name,
    short_name: b.short,
    description: "US economic calendar with countdowns, alerts, actuals and history.",
    start_url: "/",
    display: "standalone",
    background_color: b.background,
    theme_color: b.background,
    icons: [
      { src: b.icons.i192, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: b.icons.i512, sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  }, null, 2));
};
