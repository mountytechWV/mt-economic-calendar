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
//   community   optional header button {label, url}
//   credit      shown in Settings -> About
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
    accent: "#6C3FDB",
    accentHover: "#5A2FC6",
    onAccent: "#FFFFFF",
    background: "#FFFFFF",
    icons: { favicon: "/brands/le/icon-192.png", i192: "/brands/le/icon-192.png", i512: "/brands/le/icon-512.png" },
    community: { label: "Join the free Discord", url: "https://letradingacademy.com/" },
    credit: "Brought to you by LE Trading Academy",
    creditUrl: "https://letradingacademy.com/",
    defaults: { widgetDark: false },
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
