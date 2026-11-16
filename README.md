# MT Economic Calendar

A Wall Street style **US economic calendar** that runs in the browser. Countdown to the next high-impact release, a scrolling ticker, world clocks, NYSE session status, alerts, actual numbers, and a history chart for every major release. Nothing to install and no sign-up.

![MT Economic Calendar](docs/screenshot.png)

## Features

**Terminal view** (`T`)
- Week-at-a-glance table grouped by day, with impact bars, forecast vs previous arrows and a live T-minus countdown on every event
- KPI strip: next high-impact countdown, high-impact count for the week, alerts armed, feed status
- Sidebar dropdown filters: Range, Impact, Currency, Category, Show, plus search
- **Click any event** to expand it: what it measures, how markets read it, the source agency with a link to the official release, actual vs forecast vs previous, and a chart of the last 24 releases
- **Actuals** for the major US releases (CPI, PPI, PCE, payrolls, unemployment, claims, retail sales, GDP, housing, industrial production, durable goods, Empire State, Philly Fed and more), colored green or red against the forecast

**Alerts** (`A`)
- Hover any row and click its bell, or turn on *Auto-alert every high-impact event*
- A heads-up before release (1 to 30 min), an alert at release, and an alert when the actual posts
- In-page banner and sound, plus optional desktop notifications while the tab is in the background

**Live view** (`L`)
- Investing.com's official live calendar widget, US-only, with actuals that print in real time
- Today / this week, importance filter, dark or light, and a pop-out window

**Settings and defaults**
- Gear icon: alerts, time zone, view to open on, auto refresh, compact rows. These save automatically.
- **Save as default** at the bottom of the sidebar saves your filters (**Undo** reverts unsaved changes). **Reset to factory** in Settings undoes everything.
- Keyboard: `R` refresh · `T` / `L` views · `A` alerts · `/` search · `Ctrl+S` save defaults

Everything you set is stored in your own browser. There are no accounts and the site collects nothing.

## Data sources

This site does not scrape anything.

| What | Source | Notes |
|---|---|---|
| Calendar (Terminal) | [Fair Economy](https://www.faireconomy.media/) public weekly feed, the same feed behind Forex Factory's calendar export | Current week. Relayed through `/api/calendar` and cached for 10 minutes so the feed is requested rarely. |
| Actuals & history | [FRED®](https://fred.stlouisfed.org/), Federal Reserve Bank of St. Louis | Relayed through `/api/fred` with the site's key; visitors never need one. FRED usually posts within minutes of a release, and the site only shows a number once FRED has updated the series after the release time. Licensed surveys (ISM, UMich, NAHB, Conference Board) are not available. |
| Live view | [Investing.com](https://www.investing.com/webmaster-tools) embeddable economic calendar widget | Shown with Investing.com's attribution. Fastest place to see an actual print. |

This product uses the FRED® API but is not endorsed or certified by the Federal Reserve Bank of St. Louis. By using this site you agree to the [FRED® API Terms of Use](https://fred.stlouisfed.org/docs/api/terms_of_use.html).

All calendar data belongs to its providers. This project is not affiliated with Fair Economy, Forex Factory, Investing.com or the Federal Reserve Bank of St. Louis.

## Deploy your own copy (free, about 10 minutes)

The site is static HTML plus two small serverless functions, hosted on [Vercel](https://vercel.com/).

1. **Get a free FRED API key** at [fred.stlouisfed.org](https://fred.stlouisfed.org/docs/api/api_key.html). It's a 32-character code.
2. **Fork or push this repo** to your GitHub account.
3. In Vercel, choose **Add New → Project** and import the repo. Framework preset: **Other**. Leave the build settings empty.
4. Under **Environment Variables**, add `FRED_API_KEY` with your key.
5. Click **Deploy**. You get a link like `your-project.vercel.app` to share.

Every push to `main` redeploys automatically. Without `FRED_API_KEY` the site still works; actuals and history charts just stay blank.

To preview the page without deploying, open `public/index.html` straight from disk: it runs with sample data.

## Project layout

```
public/index.html       the terminal UI (HTML/CSS/JS)
public/indicators.js    event descriptions, sources and FRED series mappings
public/fonts/           bundled fonts (SIL OFL 1.1)
api/calendar.js         relays the weekly calendar feed (cached)
api/fred.js             relays FRED for the allowed series, keeps the key server-side (cached)
vercel.json             headers
```

When you add a FRED-backed event to `public/indicators.js`, add its series ID to the `ALLOWED` list in `api/fred.js`.

## License

MIT for the code. Bundled fonts under the SIL Open Font License 1.1. See `LICENSE`.
