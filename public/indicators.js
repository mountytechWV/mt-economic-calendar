/*
 * Indicator library for the detail panel.
 *
 *   m      regex (case-insensitive) matched against the event title (USD events)
 *   name   display name
 *   what   what the release measures
 *   why    how markets usually read it
 *   src    publishing agency
 *   url    official release page
 *   f      optional FRED mapping for actuals + history:
 *            s     FRED series id
 *            u     units transform (lin = level, chg = change, pch = % change, pc1 = % change from a year ago)
 *            dec   decimals shown
 *            scale multiplier applied before formatting (e.g. 0.001 to turn thousands into millions)
 *            suf   suffix ("%", "K", "M", "B")
 *
 * Events with no FRED mapping are licensed data (ISM, UMich, NAHB, Conference Board…)
 * or have no single number (speeches, minutes). They still get a description.
 */
const BULL_UP = "A higher than expected reading is usually positive for the USD; a lower reading is negative.";
const BULL_DOWN = "A lower than expected reading is usually positive for the USD; a higher reading is negative.";
const INFL = "Hotter than expected inflation raises the odds of tighter Fed policy, which is usually USD positive and pressure on stocks and bonds.";

const SRC = {
  BLS_CPI: ["Bureau of Labor Statistics", "https://www.bls.gov/cpi/"],
  BLS_PPI: ["Bureau of Labor Statistics", "https://www.bls.gov/ppi/"],
  BLS_JOBS: ["Bureau of Labor Statistics", "https://www.bls.gov/ces/"],
  BLS_CPS: ["Bureau of Labor Statistics", "https://www.bls.gov/cps/"],
  BLS_JOLTS: ["Bureau of Labor Statistics", "https://www.bls.gov/jlt/"],
  BLS_MXP: ["Bureau of Labor Statistics", "https://www.bls.gov/mxp/"],
  DOL: ["Department of Labor", "https://www.dol.gov/ui/data.pdf"],
  CEN_RETAIL: ["Census Bureau", "https://www.census.gov/retail/index.html"],
  CEN_CONST: ["Census Bureau", "https://www.census.gov/construction/nrc/index.html"],
  CEN_NHS: ["Census Bureau", "https://www.census.gov/construction/nrs/index.html"],
  CEN_M3: ["Census Bureau", "https://www.census.gov/manufacturing/m3/index.html"],
  CEN_MTIS: ["Census Bureau", "https://www.census.gov/mtis/index.html"],
  BEA_GDP: ["Bureau of Economic Analysis", "https://www.bea.gov/data/gdp/gross-domestic-product"],
  BEA_PCE: ["Bureau of Economic Analysis", "https://www.bea.gov/data/personal-consumption-expenditures-price-index"],
  BEA_INC: ["Bureau of Economic Analysis", "https://www.bea.gov/data/income-saving/personal-income"],
  BEA_TRADE: ["Bureau of Economic Analysis", "https://www.bea.gov/data/intl-trade-investment/international-trade-goods-and-services"],
  FED_G17: ["Federal Reserve Board", "https://www.federalreserve.gov/releases/g17/current/"],
  FED_FOMC: ["Federal Reserve Board", "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm"],
  FED_SPEECH: ["Federal Reserve", "https://www.federalreserve.gov/newsevents/speeches.htm"],
  NYFED: ["Federal Reserve Bank of New York", "https://www.newyorkfed.org/survey/empire/empiresurvey_overview"],
  PHILFED: ["Federal Reserve Bank of Philadelphia", "https://www.philadelphiafed.org/surveys-and-data/regional-economic-analysis/manufacturing-business-outlook-survey"],
  EIA_OIL: ["Energy Information Administration", "https://www.eia.gov/petroleum/supply/weekly/"],
  EIA_GAS: ["Energy Information Administration", "https://ir.eia.gov/ngs/ngs.html"],
  ISM: ["Institute for Supply Management", "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-report-on-business/"],
  SPG: ["S&P Global", "https://www.pmi.spglobal.com/Public/Release/ReleaseDates"],
  UMICH: ["University of Michigan", "https://www.sca.isr.umich.edu/"],
  CB: ["The Conference Board", "https://www.conference-board.org/topics/consumer-confidence"],
  NAHB: ["National Association of Home Builders", "https://www.nahb.org/news-and-economics/housing-economics/indices/housing-market-index"],
  NAR: ["National Association of Realtors", "https://www.nar.realtor/research-and-statistics/housing-statistics"],
  ADP: ["ADP Research", "https://adpemploymentreport.com/"],
  TREAS: ["U.S. Treasury", "https://www.treasurydirect.gov/auctions/upcoming/"],
  CLEV: ["Federal Reserve Bank of Cleveland", "https://www.clevelandfed.org/indicators-and-data/inflation-expectations"],
  API: ["American Petroleum Institute", "https://www.api.org/products-and-services/statistics/api-weekly-statistical-bulletin"],
};
const ind = (m, name, what, why, src, f) => ({m: new RegExp(m, "i"), name, what, why, src: SRC[src][0], url: SRC[src][1], f});

const INDICATORS = [
  // ---- inflation ----
  ind("^core cpi m/m", "Core CPI (MoM)", "Monthly change in consumer prices excluding food and energy, the Fed's preferred read on underlying CPI inflation.", INFL, "BLS_CPI", {s:"CPILFESL", u:"pch", dec:1, suf:"%"}),
  ind("^cpi m/m", "CPI (MoM)", "Monthly change in the prices consumers pay for a basket of goods and services.", INFL, "BLS_CPI", {s:"CPIAUCSL", u:"pch", dec:1, suf:"%"}),
  ind("^core cpi y/y", "Core CPI (YoY)", "Change in consumer prices excluding food and energy versus a year ago.", INFL, "BLS_CPI", {s:"CPILFENS", u:"pc1", dec:1, suf:"%"}),
  ind("^cpi y/y", "CPI (YoY)", "Headline consumer inflation versus a year ago, the number most quoted in the news.", INFL, "BLS_CPI", {s:"CPIAUCNS", u:"pc1", dec:1, suf:"%"}),
  ind("^core ppi m/m", "Core PPI (MoM)", "Monthly change in prices received by producers, excluding food and energy. A leading signal for consumer inflation.", INFL, "BLS_PPI", {s:"PPIFES", u:"pch", dec:1, suf:"%"}),
  ind("^ppi m/m", "PPI (MoM)", "Monthly change in prices received by domestic producers for final demand goods and services.", INFL, "BLS_PPI", {s:"PPIFIS", u:"pch", dec:1, suf:"%"}),
  ind("^core pce price index m/m", "Core PCE Price Index (MoM)", "The Fed's preferred inflation gauge: consumer spending prices excluding food and energy.", INFL, "BEA_PCE", {s:"PCEPILFE", u:"pch", dec:1, suf:"%"}),
  ind("^pce price index m/m", "PCE Price Index (MoM)", "Monthly change in prices of everything consumers spend on.", INFL, "BEA_PCE", {s:"PCEPI", u:"pch", dec:1, suf:"%"}),
  ind("^core pce price index y/y", "Core PCE Price Index (YoY)", "Core PCE inflation versus a year ago; the Fed targets 2%.", INFL, "BEA_PCE", {s:"PCEPILFE", u:"pc1", dec:1, suf:"%"}),
  ind("^pce price index y/y", "PCE Price Index (YoY)", "Headline PCE inflation versus a year ago.", INFL, "BEA_PCE", {s:"PCEPI", u:"pc1", dec:1, suf:"%"}),
  ind("^import prices m/m", "Import Prices (MoM)", "Monthly change in the price of goods imported into the US.", "Rising import prices feed into consumer inflation. " + BULL_UP, "BLS_MXP", {s:"IR", u:"pch", dec:1, suf:"%"}),
  ind("cleveland fed inflation", "Cleveland Fed Inflation Expectations", "Model estimate of expected inflation built from Treasury yields, inflation swaps and surveys.", "Rising expectations make the Fed more cautious about cutting rates.", "CLEV"),
  ind("inflation expectations", "UMich Inflation Expectations", "Consumers' expected inflation rate over the next year, from the University of Michigan survey.", "Rising expectations make the Fed more cautious about cutting rates.", "UMICH"),

  // ---- labor ----
  ind("^non-farm employment change", "Nonfarm Payrolls", "Jobs added or lost last month outside farming. The single most market-moving US release.", BULL_UP, "BLS_JOBS", {s:"PAYEMS", u:"chg", dec:0, suf:"K"}),
  ind("^unemployment rate", "Unemployment Rate", "Share of the labor force that is jobless and actively looking for work.", BULL_DOWN, "BLS_CPS", {s:"UNRATE", u:"lin", dec:1, suf:"%"}),
  ind("^average hourly earnings m/m", "Average Hourly Earnings (MoM)", "Monthly change in what businesses pay per hour of work. A key wage-inflation signal.", BULL_UP, "BLS_JOBS", {s:"CES0500000003", u:"pch", dec:1, suf:"%"}),
  ind("^unemployment claims", "Initial Jobless Claims", "People filing for unemployment insurance for the first time last week. The most timely labor signal.", BULL_DOWN, "DOL", {s:"ICSA", u:"lin", dec:0, scale:0.001, suf:"K"}),
  ind("^continuing claims", "Continuing Jobless Claims", "People still receiving unemployment benefits.", BULL_DOWN, "DOL", {s:"CCSA", u:"lin", dec:0, scale:0.001, suf:"K"}),
  ind("^jolts job openings", "JOLTS Job Openings", "Number of open jobs at the end of the month. Shows labor demand.", BULL_UP, "BLS_JOLTS", {s:"JTSJOL", u:"lin", dec:2, scale:0.001, suf:"M"}),
  ind("^adp", "ADP Employment", "Private-sector job estimate from payroll processor ADP. Often previews the official jobs report.", BULL_UP, "ADP"),

  // ---- growth / activity ----
  ind("gdp q/q", "GDP (QoQ, annualized)", "Annualized change in the inflation-adjusted value of all goods and services produced. The broadest measure of the economy.", BULL_UP, "BEA_GDP", {s:"A191RL1Q225SBEA", u:"lin", dec:1, suf:"%"}),
  ind("^core retail sales m/m", "Core Retail Sales (MoM)", "Monthly change in retail sales excluding autos. The cleanest read on consumer spending.", BULL_UP, "CEN_RETAIL", {s:"RSFSXMV", u:"pch", dec:1, suf:"%"}),
  ind("^retail sales m/m", "Retail Sales (MoM)", "Monthly change in total sales at stores and restaurants. Consumers drive about 70% of the US economy.", BULL_UP, "CEN_RETAIL", {s:"RSAFS", u:"pch", dec:1, suf:"%"}),
  ind("^industrial production m/m", "Industrial Production (MoM)", "Monthly change in output from factories, mines and utilities.", BULL_UP, "FED_G17", {s:"INDPRO", u:"pch", dec:1, suf:"%"}),
  ind("^capacity utilization", "Capacity Utilization", "Share of industrial capacity in use. High readings can signal inflation pressure.", BULL_UP, "FED_G17", {s:"TCU", u:"lin", dec:1, suf:"%"}),
  ind("^core durable goods orders m/m", "Core Durable Goods (MoM)", "New orders for long-lasting goods excluding transportation. A read on business investment.", BULL_UP, "CEN_M3", {s:"ADXTNO", u:"pch", dec:1, suf:"%"}),
  ind("^durable goods orders m/m", "Durable Goods Orders (MoM)", "New orders for goods meant to last 3+ years. Swings with aircraft orders.", BULL_UP, "CEN_M3", {s:"DGORDER", u:"pch", dec:1, suf:"%"}),
  ind("^business inventories m/m", "Business Inventories (MoM)", "Monthly change in inventories held by manufacturers, wholesalers and retailers.", "Usually a low-impact release; large builds can signal slowing demand.", "CEN_MTIS", {s:"BUSINV", u:"pch", dec:1, suf:"%"}),
  ind("^personal spending m/m", "Personal Spending (MoM)", "Monthly change in what consumers spend.", BULL_UP, "BEA_INC", {s:"PCE", u:"pch", dec:1, suf:"%"}),
  ind("^personal income m/m", "Personal Income (MoM)", "Monthly change in income from all sources.", BULL_UP, "BEA_INC", {s:"PI", u:"pch", dec:1, suf:"%"}),
  ind("^trade balance", "Trade Balance", "Exports minus imports of goods and services. A negative number is a deficit.", "A smaller deficit than expected is usually USD positive.", "BEA_TRADE", {s:"BOPGSTB", u:"lin", dec:1, scale:0.001, suf:"B"}),
  ind("^empire state manufacturing", "Empire State Manufacturing", "NY Fed survey of manufacturers in New York state. Above zero means conditions are improving. The first factory read each month.", BULL_UP, "NYFED", {s:"GACDISA066MSFRBNY", u:"lin", dec:1, suf:""}),
  ind("^philly fed manufacturing", "Philly Fed Manufacturing", "Philadelphia Fed survey of regional manufacturers. Above zero means expansion.", BULL_UP, "PHILFED", {s:"GACDFSA066MSFRBPHI", u:"lin", dec:1, suf:""}),
  ind("^philly fed", "Philly Fed Survey Component", "A sub-index of the Philadelphia Fed manufacturing survey.", BULL_UP, "PHILFED"),
  ind("ism (manufacturing|services)", "ISM PMI", "Survey of purchasing managers. Above 50 means expansion, below 50 contraction.", BULL_UP, "ISM"),
  ind("pmi", "S&P Global PMI", "Purchasing managers survey. Above 50 means expansion.", BULL_UP, "SPG"),

  // ---- consumer ----
  ind("uom consumer sentiment", "UMich Consumer Sentiment", "University of Michigan survey of how consumers feel about their finances and the economy.", BULL_UP, "UMICH"),
  ind("cb consumer confidence", "CB Consumer Confidence", "Conference Board survey of consumer attitudes and buying plans.", BULL_UP, "CB"),

  // ---- housing ----
  ind("^building permits", "Building Permits", "Annualized number of new residential building permits. A leading indicator for construction.", BULL_UP, "CEN_CONST", {s:"PERMIT", u:"lin", dec:2, scale:0.001, suf:"M"}),
  ind("^housing starts", "Housing Starts", "Annualized number of new homes on which construction began.", BULL_UP, "CEN_CONST", {s:"HOUST", u:"lin", dec:2, scale:0.001, suf:"M"}),
  ind("^new home sales", "New Home Sales", "Annualized sales of newly built single-family homes.", BULL_UP, "CEN_NHS", {s:"HSN1F", u:"lin", dec:0, suf:"K"}),
  ind("existing home sales", "Existing Home Sales", "Annualized sales of previously owned homes.", BULL_UP, "NAR"),
  ind("pending home sales", "Pending Home Sales", "Home contracts signed but not yet closed. Leads existing home sales.", BULL_UP, "NAR"),
  ind("nahb", "NAHB Housing Market Index", "Homebuilder confidence. Above 50 means more builders see conditions as good than poor.", BULL_UP, "NAHB"),

  // ---- energy ----
  ind("^crude oil inventories", "EIA Crude Oil Inventories", "Weekly change in US commercial crude oil stocks, in barrels.", "A bigger than expected build usually weighs on oil prices; a draw supports them.", "EIA_OIL", {s:"WCESTUS1", u:"chg", dec:1, scale:0.001, suf:"M"}),
  ind("natural gas storage", "EIA Natural Gas Storage", "Weekly change in natural gas held in underground storage.", "A smaller injection (or bigger draw) than expected usually supports natural gas prices.", "EIA_GAS"),
  ind("^api weekly", "API Weekly Statistical Bulletin", "Industry estimate of oil inventories released the evening before the official EIA data.", "Traders use it to position ahead of Wednesday's EIA report.", "API"),

  // ---- Fed ----
  ind("^fomc statement", "FOMC Statement", "The Fed's policy statement released with each rate decision.", "Wording changes about inflation, jobs and future moves can move markets as much as the rate itself.", "FED_FOMC"),
  ind("^federal funds rate", "Fed Interest Rate Decision", "The Federal Reserve's target range for overnight lending between banks.", "A hike (or fewer expected cuts) is USD positive; a cut is USD negative.", "FED_FOMC"),
  ind("^fomc press conference", "FOMC Press Conference", "The Fed Chair explains the rate decision and takes questions.", "Tone on future moves often drives the biggest market reaction of the day.", "FED_FOMC"),
  ind("^fomc meeting minutes", "FOMC Meeting Minutes", "Detailed record of the last Fed policy meeting, released three weeks later.", "Shows how many officials lean toward hikes or cuts.", "FED_FOMC"),
  ind("^fomc economic projections", "Fed Economic Projections", "Officials' forecasts for growth, unemployment, inflation and the rate path (the dot plot).", "A higher dot plot is USD positive.", "FED_FOMC"),
  ind("beige book", "Beige Book", "Anecdotal report on economic conditions across the 12 Fed districts.", "Usually low impact; watched for shifts in tone.", "FED_FOMC"),
  ind("speaks|testif", "Fed Speaker", "A Federal Reserve official speaks publicly.", "Comments that lean hawkish (rates higher for longer) are USD positive; dovish comments are USD negative. The Chair matters most.", "FED_SPEECH"),

  // ---- bonds ----
  ind("auction", "Treasury Auction", "The Treasury sells government debt. The number shown is the auction's high yield.", "Weak demand (a higher yield than expected) can push yields up across the curve.", "TREAS"),
];

const GENERIC = {name:"Economic release", what:"A scheduled US economic data release.", why:"Compare the actual to the forecast: a big surprise in either direction is what moves markets.", src:"", url:""};
function indicatorFor(e){
  if (e.country !== "USD") return null;
  return INDICATORS.find(x => x.m.test(e.title)) || null;
}
