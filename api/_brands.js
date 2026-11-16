// Brand definitions. Each Vercel project picks one with the BRAND environment
// variable (BRAND=le). No BRAND set = "mt". Files starting with "_" in /api are
// not public routes.
//
//   name        app name (browser tab, home-screen app)
//   short       home-screen label (keep it under ~12 characters)
//   mark        letters in the square logo block (used when there's no logo image)
//   logo        optional square logo image under /public, e.g. "/brands/le/logo.png"
//   title       header wordmark: [plain word, accent word]
//   sub         small line under the wordmark
//   theme       "dark" or "light"
//   accent      main brand color; accentHover is a slightly darker/lighter shade
//   onAccent    text color on top of the accent (white for dark accents, black for light ones)
//   vars        optional overrides for any theme color (CSS variables)
//   chrome      optional colored frame {header, ticker, kpi, side} around a light calendar
//   community   optional header button {label, url}
//   credit      shown in Settings -> About (developer adds a second line)
//   defaults    starting settings for new visitors (any key from the app's settings)

const BRANDS = {
  mt: {
    name: "MT Economic Calendar",
    short: "MT Econ",
    mark: "MT",
    logo: "",
    title: ["Econ", "Terminal"],
    sub: "US Macro Calendar",
    theme: "dark",
    accent: "#FFB000",
    accentHover: "#FFC233",
    onAccent: "#000000",
    background: "#05070A",
    icons: { favicon: "/icon.png", i192: "/icon-192.png", i512: "/icon-512.png" },
    community: null,
    credit: "Built by MountyTech",
    creditUrl: "https://github.com/mountytechWV/mt-economic-calendar",
    defaults: {},
  },

  le: {
    name: "LE Economic Calendar",
    short: "LE Calendar",
    mark: "LE",
    logo: "",                     // drop Elly's square logo at public/brands/le/logo.png and set "/brands/le/logo.png"
    title: ["Econ", "Calendar"],
    sub: "LE Trading Academy",
    theme: "light",
    accent: "#673AB7",            // Elly's purple (letradingacademy.com)
    accentHover: "#5E35B1",
    onAccent: "#FFFFFF",
    background: "#673AB7",
    // colored frame: header, ticker strip, KPI tiles and sidebar (the calendar stays white)
    chrome: { header: "#673AB7", ticker: "#4527A0", kpi: "#5E35B1", side: "#512DA8" },   // deep purple 500/800/600/700
    icons: { favicon: "/brands/le/icon-192.png", i192: "/brands/le/icon-192.png", i512: "/brands/le/icon-512.png" },
    community: { label: "Join the free Discord", url: "https://discord.gg/letradingacademy" },
    credit: "Brought to you by LE Trading Academy",
    creditUrl: "https://letradingacademy.com/",
    developer: "Developed by MountyTech",
    developerUrl: "https://github.com/mountytechWV",
    defaults: { widgetDark: false },
  },

  kt: {
    name: "Kingdom Traders Econ Calendar",
    short: "KT Calendar",
    mark: "KT",
    logo: "/brands/kt/mark.png",  // crown + candlestick chart from the Kingdom Traders emblem
    title: ["Kingdom", "Traders"],
    sub: "Economic Calendar",
    theme: "dark",
    accent: "#E0B25C",            // Kingdom Gold
    accentHover: "#F7DA94",       // Bright
    onAccent: "#00051B",          // Deep Navy
    background: "#3A1F6E",
    // purple frame around a deep-navy calendar
    chrome: { header: "#3A1F6E", ticker: "#2B1A5B", kpi: "#4A2A84", side: "#2B1A5B" },
    vars: {
      // Deep Navy calendar
      "--bg": "#00051B", "--bg2": "#030A26", "--panel": "#06102E", "--panel2": "#0A1638",
      "--line": "#141F45", "--line2": "#1F2C5A", "--line3": "#33407A",
      "--text": "#E8E6F2", "--dim": "#9A9CC0", "--mute": "#5D6290", "--strong": "#FFFFFF",
      "--top1": "#3A1F6E", "--top2": "#3A1F6E", "--bar-bg": "#030A26", "--thead": "#030A26",
      "--rowline": "#111B3E", "--rowhover": "#081233", "--day1": "#1A1450", "--day2": "#06102E",
      "--openbg": "rgba(74,42,132,.28)", "--detbg": "rgba(74,42,132,.22)", "--cyan": "#B79CFF",
      "--chart-bar": "#3B2A78", "--chart-neg": "#5A2A40",
      // frame accents: gold pops, navy fields
      "--ch-pop": "#E0B25C", "--ch-on-pop": "#00051B", "--ch-hi": "#F7DA94",
      "--ch-field": "rgba(0,5,27,.55)", "--ch-field-text": "#F2EFFA",
    },
    icons: { favicon: "/brands/kt/icon-192.png", i192: "/brands/kt/icon-192.png", i512: "/brands/kt/icon-512.png" },
    community: null,
    credit: "Kingdom Traders",
    creditUrl: "",
    developer: "Developed by MountyTech",
    developerUrl: "https://github.com/mountytechWV",
    defaults: {},
  },
};

function hexToRgb(hex) {
  const h = String(hex).replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

function currentBrand() {
  const id = String(process.env.BRAND || "mt").toLowerCase().trim();
  const b = BRANDS[id] || BRANDS.mt;
  return { id: BRANDS[id] ? id : "mt", ...b, accentRgb: hexToRgb(b.accent) };
}

module.exports = { BRANDS, currentBrand };
