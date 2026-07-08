const storageKey = "life-progress-dashboard-v1";
const dailyEntryLimit = 5;
const averageRetirementAge = 65;
const outcomeCategories = {
  market: ["投資評価額", "株式", "投資信託", "暗号資産", "その他市場"],
  profit: ["商品販売", "コンテンツ販売", "受託・サービス", "その他副業"],
  dividend: ["株式配当", "投信分配金", "利息", "その他配当"],
  spending: ["食費", "外食", "交通", "固定費", "その他支出"],
  saving: ["買い物を見送った", "外食を減らした", "固定費削減", "その他の節約"]
};

const outcomeTypeLabels = {
  market: "市場",
  profit: "副業",
  dividend: "配当",
  spending: "支出",
  saving: "節約"
};

const heroTitleOptions = [
  "自由までの距離",
  "本当の人生が始まるまで",
  "自由を買い戻す旅",
  "自分の人生を奪還するまで",
  "残りの「縛られた」時間",
  "労働から解放される日まで",
  "ラットレース脱出への道",
  "「働かなくていい」までの距離",
  "目覚まし時計を捨てる日まで",
  "日曜の夜に笑える日まで",
  "「何もしない」を手に入れるまで"
];

const returnScenarioLabels = {
  conservative: "保守",
  standard: "標準",
  aggressive: "強気"
};

const holdingReturnScenarios = {
  "emaxis-slim-all-country": { conservative: 5, standard: 7, aggressive: 8.5 },
  "emaxis-slim-sp500": { conservative: 6, standard: 8.5, aggressive: 10 },
  "rakuten-plus-sp500": { conservative: 6, standard: 8.5, aggressive: 10 },
  "rakuten-plus-all-country": { conservative: 5, standard: 7, aggressive: 8.5 },
  "rakuten-schd": { conservative: 2.5, standard: 4, aggressive: 5.5 },
  "sbi-v-sp500": { conservative: 6, standard: 8.5, aggressive: 10 },
  "sbi-v-total-stock-market": { conservative: 5.8, standard: 8, aggressive: 9.5 },
  "ifree-next-fang-plus": { conservative: 6, standard: 10, aggressive: 13 },
  "nissay-nasdaq100": { conservative: 6, standard: 9.5, aggressive: 12 },
  "rakuten-vti": { conservative: 5.8, standard: 8, aggressive: 9.5 },
  "emaxis-slim-all-country-ex-japan": { conservative: 5, standard: 7, aggressive: 8.5 },
  SPYD: { conservative: 0.5, standard: 2, aggressive: 3.5 },
  HDV: { conservative: 1, standard: 2.5, aggressive: 4 },
  VYM: { conservative: 2, standard: 4, aggressive: 5.5 },
  "nf-nikkei-high-dividend-50": { conservative: 0.5, standard: 2.5, aggressive: 4 },
  NVDA: { conservative: 6, standard: 10, aggressive: 15 },
  KDDI: { conservative: 0.5, standard: 2, aggressive: 3.5 },
  BTI: { conservative: 0, standard: 0, aggressive: 2 }
};

const holdingPresets = [
  { symbol: "emaxis-slim-all-country", name: "eMAXIS Slim 全世界株式", category: "fund", source: "apps-script", ticker: "emaxis-slim-all-country", dividendYield: 0, expectedReturnRate: 5, rank: 1, broker: "楽天/SBI" },
  { symbol: "emaxis-slim-sp500", name: "eMAXIS Slim S&P500", category: "fund", source: "apps-script", ticker: "emaxis-slim-sp500", dividendYield: 0, expectedReturnRate: 6, rank: 2, broker: "楽天/SBI" },
  { symbol: "rakuten-plus-sp500", name: "楽天プラス S&P500", category: "fund", source: "apps-script", ticker: "rakuten-plus-sp500", dividendYield: 0, expectedReturnRate: 6, rank: 3, broker: "楽天" },
  { symbol: "rakuten-plus-all-country", name: "楽天プラス オールカントリー", category: "fund", source: "apps-script", ticker: "rakuten-plus-all-country", dividendYield: 0, expectedReturnRate: 5, rank: 4, broker: "楽天" },
  { symbol: "rakuten-schd", name: "楽天SCHD", category: "fund", source: "apps-script", ticker: "rakuten-schd", dividendYield: 3.3, expectedReturnRate: 4, dividendMonths: [2, 5, 8, 11], dividendDay: 25, rank: 5, broker: "楽天/SBI" },
  { symbol: "sbi-v-sp500", name: "SBI・V・S&P500", category: "fund", source: "apps-script", ticker: "sbi-v-sp500", dividendYield: 0, expectedReturnRate: 6, rank: 6, broker: "SBI" },
  { symbol: "sbi-v-total-stock-market", name: "SBI・V・全米株式", category: "fund", source: "apps-script", ticker: "sbi-v-total-stock-market", dividendYield: 0, expectedReturnRate: 5.5, rank: 7, broker: "SBI" },
  { symbol: "ifree-next-fang-plus", name: "iFreeNEXT FANG+インデックス", category: "fund", source: "apps-script", ticker: "ifree-next-fang-plus", dividendYield: 0, expectedReturnRate: 7, rank: 8, broker: "楽天/SBI" },
  { symbol: "nissay-nasdaq100", name: "ニッセイNASDAQ100インデックス", category: "fund", source: "apps-script", ticker: "nissay-nasdaq100", dividendYield: 0, expectedReturnRate: 7, rank: 9, broker: "楽天/SBI" },
  { symbol: "rakuten-vti", name: "楽天・全米株式インデックス", category: "fund", source: "apps-script", ticker: "rakuten-vti", dividendYield: 0, expectedReturnRate: 5.5, rank: 10, broker: "楽天" },
  { symbol: "emaxis-slim-all-country-ex-japan", name: "eMAXIS Slim 全世界株式 除く日本", category: "fund", source: "apps-script", ticker: "emaxis-slim-all-country-ex-japan", dividendYield: 0, expectedReturnRate: 5, rank: 11, broker: "楽天/SBI" },
  { symbol: "SPYD", name: "SPYD", category: "etf", source: "googlefinance", ticker: "NYSEARCA:SPYD", dividendYield: 4.5, expectedReturnRate: 2, dividendMonths: [3, 6, 9, 12], dividendDay: 25, rank: 101, broker: "米国ETF" },
  { symbol: "HDV", name: "HDV", category: "etf", source: "googlefinance", ticker: "NYSEARCA:HDV", dividendYield: 3.5, expectedReturnRate: 2.5, dividendMonths: [3, 6, 9, 12], dividendDay: 25, rank: 102, broker: "米国ETF" },
  { symbol: "VYM", name: "VYM", category: "etf", source: "googlefinance", ticker: "NYSEARCA:VYM", dividendYield: 2.7, expectedReturnRate: 4, dividendMonths: [3, 6, 9, 12], dividendDay: 25, rank: 103, broker: "米国ETF" },
  { symbol: "nf-nikkei-high-dividend-50", name: "NF日経高配当50", category: "etf", source: "googlefinance", ticker: "TYO:1489", dividendYield: 3.4, expectedReturnRate: 2.5, dividendMonths: [1, 4, 7, 10], dividendDay: 15, rank: 104, broker: "国内ETF" },
  { symbol: "SPCX", name: "スペースX", category: "stock", source: "googlefinance", ticker: "NASDAQ:SPCX", dividendYield: 0, expectedReturnRate: 0, rank: 201, broker: "米国株" },
  { symbol: "NVDA", name: "エヌビディア", category: "stock", source: "googlefinance", ticker: "NASDAQ:NVDA", dividendYield: 0.03, expectedReturnRate: 7, dividendMonths: [3, 6, 9, 12], dividendDay: 25, rank: 202, broker: "米国株" },
  { symbol: "KDDI", name: "KDDI", category: "stock", source: "googlefinance", ticker: "TYO:9433", dividendYield: 3.0, expectedReturnRate: 2, dividendMonths: [6, 12], dividendDay: 20, rank: 203, broker: "国内株" },
  { symbol: "BTI", name: "BTI", category: "stock", source: "googlefinance", ticker: "NYSE:BTI", dividendYield: 7.0, expectedReturnRate: 0, dividendMonths: [2, 5, 8, 11], dividendDay: 10, rank: 204, broker: "米国株" },
  { symbol: "BTC", name: "ビットコイン", category: "crypto", source: "coingecko", ticker: "bitcoin", dividendYield: 0, expectedReturnRate: 0, rank: 301, broker: "暗号資産", aliases: ["bitcoin"] },
  { symbol: "ETH", name: "イーサリアム", category: "crypto", source: "coingecko", ticker: "ethereum", dividendYield: 0, expectedReturnRate: 0, rank: 302, broker: "暗号資産", aliases: ["ethereum"] },
  { symbol: "XRP", name: "リップル", category: "crypto", source: "coingecko", ticker: "ripple", dividendYield: 0, expectedReturnRate: 0, rank: 303, broker: "暗号資産", aliases: ["ripple"] },
  { symbol: "SOL", name: "ソラナ", category: "crypto", source: "coingecko", ticker: "solana", dividendYield: 0, expectedReturnRate: 0, rank: 304, broker: "暗号資産", aliases: ["solana"] },
  { symbol: "custom", name: "その他", category: "custom", source: "manual", ticker: "", dividendYield: 0, rank: 999, broker: "手入力" }
];

const defaultInvestmentHoldings = [];

const defaultInvestmentTotal = defaultInvestmentHoldings.reduce((sum, item) => sum + item.value, 0);
const defaultAnnualDividends = Math.round(defaultInvestmentHoldings.reduce((sum, item) => {
  const preset = holdingPresets.find((presetItem) => presetItem.symbol === item.symbol);
  return sum + item.value * (Number(preset?.dividendYield) || 0) / 100;
}, 0));

const defaultState = {
  profile: {
    birthDate: "",
    currentAge: 29,
    targetAge: 45,
    heroTitle: "自由までの距離",
    householdType: "twoPlus",
    growthRateMode: "manual",
    returnScenario: "standard",
    investmentGrowthRate: 5,
    monthlyInvestmentAmount: 50000,
    monthlyExpense: 0,
    dailyCost: 4164,
    yearlyAssetGrowth: 0,
    fireGoal: 50000000
  },
  assets: {
    investments: defaultInvestmentTotal,
    cash: 0,
    dividends: defaultAnnualDividends
  },
  investmentHoldings: defaultInvestmentHoldings,
  investmentValuationBaseline: null,
  assetHistory: [],
  sideHustles: [
    { name: "商品販売", sales: 0, profit: 0, previousProfit: 0 },
    { name: "コンテンツ販売", sales: 0, profit: 0, previousProfit: 0 },
    { name: "その他副業", sales: 0, profit: 0, previousProfit: 0 }
  ],
  lastUpdatedAt: null,
  lastMonthlyChange: null,
  fireCountdownPlan: null,
  lastCountdownActionDate: null,
  totalConfirmedSavedTime: 0,
  currentMicroGoal: null,
  progressEntries: [],
  outcomeEntries: [],
  outcomeQuickActions: [
    { id: "outcome-quick-profit-1000", type: "profit", label: "副業 +¥1,000", category: "副業利益", amount: 1000 },
    { id: "outcome-quick-profit-3000", type: "profit", label: "副業 +¥3,000", category: "副業利益", amount: 3000 },
    { id: "outcome-quick-saving-500", type: "saving", label: "節約 +¥500", category: "節約", amount: 500 },
    { id: "outcome-quick-saving-1000", type: "saving", label: "節約 +¥1,000", category: "節約", amount: 1000 }
  ],
  quickActions: [
    { id: "quick-learning", label: "学習30分", text: "学習30分" },
    { id: "quick-exercise", label: "運動30分", text: "運動30分" },
    { id: "quick-side-work", label: "副業作業", text: "副業作業を進めた" },
    { id: "quick-reading", label: "読書30分", text: "読書30分" }
  ],
  dividendGoals: [
    { id: "reward-dinner", label: "特別なディナー", cost: 15000 },
    { id: "reward-daytrip", label: "日帰りのお出かけ", cost: 30000 },
    { id: "reward-trip", label: "旅行", cost: 150000 }
  ],
  victoryGoals: [
    { id: "victory-profit", label: "副業利益", metric: "profit", target: 10000 },
    { id: "victory-asset", label: "資産増加", metric: "assetGrowth", target: 50000 },
    { id: "victory-saving", label: "節約", metric: "saving", target: 5000 }
  ],
  legacyOutcomeMigrationComplete: true
};

let state = loadState();
let currentView = localStorage.getItem("life-progress-view") || "overview";
let saveStatusTimer = null;
let dailyStatusTimer = null;
let backupStatusTimer = null;
let profileStatusTimer = null;
let customizationStatusTimer = null;
let outcomeStatusTimer = null;
let holdingsStatusTimer = null;
let holdingsAutoSaveTimer = null;
let refreshAllTimer = null;
let outcomeSnackTimer = null;
let buybackToastTimer = null;
let dailyCountdownActionTimer = null;
let fireCountdownBaseSeconds = 0;
let fireCountdownTargetAt = null;
let forceFireCountdownReplan = false;
let holdingFilterType = localStorage.getItem("life-progress-holding-filter-type") || "fund";
let holdingSearchQuery = localStorage.getItem("life-progress-holding-search") || "";
let activeHoldingId = null;
const swipeViewOrder = ["overview", "review", "input"];
const swipeState = {
  startX: 0,
  startY: 0,
  tracking: false
};

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 0
});

const colors = {
  investments: "#2f7d52",
  cash: "#3b647f",
  dividends: "#9a6f24"
};

function todayKey() {
  return formatDateKey(new Date());
}

function formatDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function currentMonthKey() {
  return todayKey().slice(0, 7);
}

function previousMonthKey(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const previousYear = month === 1 ? year - 1 : year;
  const previousMonth = month === 1 ? 12 : month - 1;
  return `${previousYear}-${String(previousMonth).padStart(2, "0")}`;
}

function loadState() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return cloneDefaultState();

  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return cloneDefaultState();
  }
}

function normalizeState(saved = {}) {
  const progressEntries = migrateProgressEntries(saved.progressEntries || []);
  const outcomeMigration = migrateLegacyOutcomes(saved, normalizeOutcomeEntries(saved.outcomeEntries));
  const useDefaultInvestmentHoldings = shouldUseDefaultInvestmentHoldings(saved);
  const investmentHoldings = useDefaultInvestmentHoldings ? defaultInvestmentHoldings : saved.investmentHoldings;
  const normalizedInvestmentHoldings = normalizeInvestmentHoldings(investmentHoldings, saved.assets);
  const assets = { ...defaultState.assets, ...(saved.assets || {}), ...(useDefaultInvestmentHoldings ? { investments: defaultInvestmentTotal } : {}) };
  assets.dividends = annualDividendsFromHoldings(normalizedInvestmentHoldings);
  const profile = { ...defaultState.profile, ...(saved.profile || {}) };
  if (saved.profile && !Object.hasOwn(saved.profile, "monthlyInvestmentAmount")) {
    profile.monthlyInvestmentAmount = 0;
  }
  if (!heroTitleOptions.includes(profile.heroTitle)) {
    profile.heroTitle = defaultState.profile.heroTitle;
  }
  if (!Object.hasOwn(returnScenarioLabels, profile.returnScenario)) {
    profile.returnScenario = defaultState.profile.returnScenario;
  }
  if (!Number(profile.dailyCost)) {
    profile.dailyCost = Math.max(1, Math.round((Number(profile.monthlyExpense) || 0) / 30) || defaultState.profile.dailyCost);
  }
  return {
    ...cloneDefaultState(),
    ...saved,
    profile,
    assets,
    investmentHoldings: normalizedInvestmentHoldings,
    investmentValuationBaseline: normalizeInvestmentValuationBaseline(saved.investmentValuationBaseline),
    assetHistory: ensureBaselineAssetHistory(saved.assetHistory || []),
    sideHustles: normalizeSideHustles(saved.sideHustles),
    fireCountdownPlan: normalizeFireCountdownPlan(saved.fireCountdownPlan),
    lastCountdownActionDate: typeof saved.lastCountdownActionDate === "string" ? saved.lastCountdownActionDate : null,
    totalConfirmedSavedTime: Math.max(0, Math.round(Number(saved.totalConfirmedSavedTime) || 0)),
    currentMicroGoal: saved.currentMicroGoal && typeof saved.currentMicroGoal === "object" ? saved.currentMicroGoal : null,
    progressEntries,
    outcomeEntries: outcomeMigration.entries,
    outcomeQuickActions: normalizeOutcomeQuickActions(saved.outcomeQuickActions),
    quickActions: normalizeQuickActions(saved.quickActions),
    dividendGoals: normalizeDividendGoals(saved.dividendGoals),
    victoryGoals: normalizeVictoryGoals(saved.victoryGoals),
    legacyOutcomeMigrationComplete: outcomeMigration.complete
  };
}

function shouldUseDefaultInvestmentHoldings(saved = {}) {
  if (!Array.isArray(saved.investmentHoldings) || !saved.investmentHoldings.length) return true;
  if (saved.investmentHoldings.length !== 1) return false;
  const [item] = saved.investmentHoldings;
  return item?.id === "holding-total" && item?.symbol === "custom" && item?.name === "投資合計";
}

function migrateLegacyOutcomes(saved, entries) {
  if (saved.legacyOutcomeMigrationComplete) return { entries, complete: true };
  const migrated = [...entries];
  const month = currentMonthKey();
  const legacyItems = Array.isArray(saved.sideHustles) ? saved.sideHustles : [];

  legacyItems.forEach((item, index) => {
    const recorded = migrated
      .filter((entry) => entry.type === "profit" && entry.date.startsWith(month) && entry.category === item.name)
      .reduce((totals, entry) => ({ sales: totals.sales + entry.sales, profit: totals.profit + entry.amount }), { sales: 0, profit: 0 });
    const sales = Math.max(0, (Number(item.sales) || 0) - recorded.sales);
    const amount = Math.max(0, (Number(item.profit) || 0) - recorded.profit);
    if (!sales && !amount) return;
    migrated.push({
      id: `legacy-outcome-${month}-${index}`,
      date: `${month}-01`,
      type: "profit",
      category: String(item.name || `副業${index + 1}`),
      sales,
      amount,
      appliedToMonthlyTotals: false
    });
  });

  return { entries: normalizeOutcomeEntries(migrated), complete: true };
}

function normalizeOutcomeEntries(entries) {
  if (!Array.isArray(entries)) return [];
  return entries
    .filter((entry) => entry && Object.hasOwn(outcomeCategories, entry.type) && (Number(entry.amount) !== 0 || Number(entry.sales) > 0))
    .map((entry, index) => ({
      id: entry.id || `outcome-${entry.date || "unknown"}-${index}`,
      date: typeof entry.date === "string" ? entry.date.slice(0, 10) : todayKey(),
      type: entry.type,
      category: String(entry.category || outcomeCategories[entry.type]?.at(-1) || "その他"),
      sales: entry.type === "profit" ? Math.max(0, Number(entry.sales) || 0) : 0,
      amount: entry.type === "market" ? Number(entry.amount) || 0 : Math.max(0, Number(entry.amount) || 0),
      appliedToMonthlyTotals: Boolean(entry.appliedToMonthlyTotals)
    }));
}

function normalizeSideHustles(items) {
  const savedItems = Array.isArray(items) ? items : [];
  return defaultState.sideHustles.map((fallback, index) => {
    const saved = savedItems.find((item) => item?.name === fallback.name) || savedItems[index] || {};
    return {
      name: fallback.name,
      sales: Number(saved.sales) || 0,
      profit: Number(saved.profit) || 0,
      previousProfit: Number(saved.previousProfit) || 0
    };
  });
}

function normalizeInvestmentHoldings(items, savedAssets = {}) {
  const savedInvestmentTotal = Number(savedAssets?.investments) || defaultState.assets.investments;
  const source = Array.isArray(items) && items.length
    ? items
    : savedInvestmentTotal > 0
      ? [{ id: "holding-total", symbol: "custom", name: "投資合計", value: savedInvestmentTotal }]
      : [];

  return source
    .filter((item) => item && String(item.name || "").trim())
    .slice(0, 20)
    .map((item, index) => {
      const fallbackValue = Math.max(0, Math.round(Number(item.value) || 0));
      const legacyQuantity = Math.max(0, Number(item.quantity) || 0);
      const legacyPrice = Math.max(0, Math.round(Number(item.price) || 0));
      const value = fallbackValue || Math.max(0, Math.round(legacyQuantity * legacyPrice));
      const preset = holdingPresets.find((presetItem) => presetItem.symbol === item.symbol || presetItem.name === item.name);
      return {
        id: String(item.id || `holding-${index}-${String(item.name).slice(0, 12)}`),
        symbol: preset?.symbol || "custom",
        name: String(item.name).trim().slice(0, 28),
        category: preset?.category || item.category || "custom",
        source: preset?.source || item.source || "manual",
        ticker: preset?.ticker || item.ticker || "",
        dividendYield: typeof item.dividendYield === "number" ? item.dividendYield : Number(preset?.dividendYield) || 0,
        expectedReturnRate: typeof item.expectedReturnRate === "number" ? item.expectedReturnRate : Number(preset?.expectedReturnRate ?? defaultState.profile.investmentGrowthRate) || 0,
        quantity: Math.max(0, Number(item.quantity) || 0),
        price: Math.max(0, Number(item.price) || 0),
        priceUpdatedAt: typeof item.priceUpdatedAt === "string" ? item.priceUpdatedAt : "",
        value
      };
    });
}

function annualDividendsFromHoldings(holdings = state.investmentHoldings) {
  return Math.round(holdings.reduce((sum, item) => sum + (Number(item.value) || 0) * holdingDividendYield(item) / 100, 0));
}

function holdingDividendYield(item) {
  const preset = holdingPresets.find((presetItem) => presetItem.symbol === item.symbol || presetItem.name === item.name);
  return Math.max(0, Number(item.dividendYield ?? preset?.dividendYield) || 0);
}

function holdingExpectedReturnRate(item) {
  const preset = holdingPresets.find((presetItem) => presetItem.symbol === item.symbol || presetItem.name === item.name);
  const scenario = Object.hasOwn(returnScenarioLabels, state.profile.returnScenario) ? state.profile.returnScenario : "standard";
  const scenarioRates = holdingReturnScenarios[item.symbol] || holdingReturnScenarios[preset?.symbol];
  if (scenarioRates) return Math.max(0, Number(scenarioRates[scenario] ?? scenarioRates.standard) || 0);
  return Math.max(0, Number(item.expectedReturnRate ?? preset?.expectedReturnRate ?? state.profile.investmentGrowthRate) || 0);
}

function weightedHoldingYield() {
  const total = state.investmentHoldings.reduce((sum, item) => sum + Math.max(0, Number(item.value) || 0), 0);
  if (total <= 0) return Math.max(0, Number(state.profile.investmentGrowthRate) || 0);
  const weighted = state.investmentHoldings.reduce((sum, item) => {
    const value = Math.max(0, Number(item.value) || 0);
    return sum + value * holdingExpectedReturnRate(item);
  }, 0);
  return roundOne(weighted / total);
}

function effectiveInvestmentGrowthRate() {
  return state.profile.growthRateMode === "holdings"
    ? weightedHoldingYield()
    : Math.max(0, Number(state.profile.investmentGrowthRate) || 0);
}

function growthRateNoteText() {
  if (state.profile.growthRateMode === "holdings") {
    const scenario = Object.hasOwn(returnScenarioLabels, state.profile.returnScenario) ? state.profile.returnScenario : "standard";
    const sp500Rate = holdingReturnScenarios["emaxis-slim-sp500"][scenario];
    const allCountryRate = holdingReturnScenarios["emaxis-slim-all-country"][scenario];
    return `保有銘柄の想定リターンは株価・基準価額成長の前提です。${returnScenarioLabels[scenario]}前提（S&P500 ${sp500Rate}%・全世界 ${allCountryRate}%目安）を評価額で加重平均し、配当・分配金は年間配当として別計上します。`;
  }
  return "想定利回りは自分で決めた前提です。FIRE年数の目安計算に使うもので、将来リターンを保証するものではありません。";
}

function applyScheduledDividendEntries(referenceDate = new Date()) {
  const month = referenceDate.getMonth() + 1;
  const day = referenceDate.getDate();
  const monthKey = formatDateKey(referenceDate).slice(0, 7);
  const additions = [];

  state.investmentHoldings.forEach((holding) => {
    const preset = holdingPresets.find((item) => item.symbol === holding.symbol || item.name === holding.name);
    const months = Array.isArray(preset?.dividendMonths) ? preset.dividendMonths : [];
    const dividendDay = Number(preset?.dividendDay) || 1;
    if (!months.includes(month) || day < dividendDay) return;

    const holdingKey = holding.id || holding.symbol || holding.name || "holding";
    const id = `auto-dividend-${monthKey}-${holdingKey}`;
    if (state.outcomeEntries.some((entry) => entry.id === id)) return;

    const annualDividend = (Number(holding.value) || 0) * holdingDividendYield(holding) / 100;
    const amount = Math.round(annualDividend / Math.max(1, months.length));
    if (amount <= 0) return;

    additions.push({
      id,
      date: `${monthKey}-${String(dividendDay).padStart(2, "0")}`,
      type: "dividend",
      category: `${holding.name} 自動配当`,
      sales: 0,
      amount,
      appliedToMonthlyTotals: false
    });
  });

  if (!additions.length) return;
  state.outcomeEntries.push(...additions);
  saveState();
}

function normalizeInvestmentValuationBaseline(item) {
  if (!item || typeof item !== "object") return null;
  return {
    date: typeof item.date === "string" ? item.date.slice(0, 10) : todayKey(),
    value: Math.max(0, Math.round(Number(item.value) || 0))
  };
}

function normalizeFireCountdownPlan(item) {
  if (!item || typeof item !== "object") return null;
  const signature = typeof item.signature === "string" ? item.signature : "";
  const targetAt = Number(item.targetAt) || 0;
  if (!signature || targetAt <= 0) return null;
  return { signature, targetAt };
}

function normalizeQuickActions(items) {
  const source = Array.isArray(items) ? items : defaultState.quickActions;
  return source
    .filter((item) => item && String(item.label || item.text || "").trim())
    .slice(0, 8)
    .map((item, index) => ({
      id: String(item.id || `quick-${index}-${String(item.label || item.text).slice(0, 12)}`),
      label: String(item.label || item.text).trim().slice(0, 16),
      text: String(item.text || item.label).trim().slice(0, 40)
    }));
}

function normalizeOutcomeQuickActions(items) {
  const source = Array.isArray(items) ? items : defaultState.outcomeQuickActions;
  const validTypes = ["profit", "saving"];
  return source
    .filter((item) => item && validTypes.includes(item.type) && String(item.label || "").trim() && Number(item.amount) > 0)
    .slice(0, 8)
    .map((item, index) => {
      const type = validTypes.includes(item.type) ? item.type : "profit";
      const label = String(item.label).trim().slice(0, 18);
      return {
        id: String(item.id || `outcome-quick-${index}-${label.slice(0, 10)}`),
        type,
        label,
        category: String(item.category || outcomeCategories[type]?.[0] || outcomeTypeLabels[type]).trim().slice(0, 24),
        amount: Math.max(1, Math.round(Number(item.amount) || 0))
      };
    });
}

function normalizeDividendGoals(items) {
  const source = Array.isArray(items) ? items : defaultState.dividendGoals;
  return source
    .filter((item) => item && String(item.label || "").trim() && Number(item.cost) > 0)
    .slice(0, 8)
    .map((item, index) => ({
      id: String(item.id || `reward-${index}-${String(item.label).slice(0, 12)}`),
      label: String(item.label).trim().slice(0, 24),
      cost: Math.max(1, Math.round(Number(item.cost) || 0))
    }));
}

function normalizeVictoryGoals(items) {
  const source = Array.isArray(items) ? items : defaultState.victoryGoals;
  const validMetrics = ["profit", "saving", "assetGrowth"];
  return source
    .filter((item) => item && String(item.label || "").trim() && validMetrics.includes(item.metric) && Number(item.target) > 0)
    .slice(0, 8)
    .map((item, index) => ({
      id: String(item.id || `victory-${index}-${String(item.label).slice(0, 12)}`),
      label: String(item.label).trim().slice(0, 20),
      metric: item.metric,
      target: Math.max(1, Math.round(Number(item.target) || 0))
    }));
}

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("fire-dashboard-state-saved", {
    detail: { state: cloneState(state) }
  }));
}

function cloneState(value) {
  return JSON.parse(JSON.stringify(value));
}

function applyCloudState(cloudState) {
  state = normalizeState(cloudState);
  localStorage.setItem(storageKey, JSON.stringify(state));
  render();
}

function migrateProgressEntries(entries) {
  const sampleTexts = ["ゲーム出品1件", "AI学習30分"];
  const isOldSampleData =
    entries.length === 2 &&
    entries.every((entry) => entry.date === todayKey() && sampleTexts.includes(entry.text));

  if (isOldSampleData) return [];

  return entries.map((entry, index) => ({
    ...entry,
    id: entry.id || createProgressId(entry, index)
  }));
}

function createProgressId(entry, index = 0) {
  const text = String(entry.text || "").replace(/[^a-zA-Z0-9ぁ-んァ-ン一-龥]/g, "").slice(0, 18);
  return `progress-${entry.date || "unknown"}-${index}-${text}`;
}

function normalizeAssetHistory(history) {
  return history
    .filter((item) => item && typeof item.month === "string")
    .map((item) => ({
      month: item.month.slice(0, 7),
      total: Number(item.total) || 0,
      dividends: typeof item.dividends === "number" ? item.dividends : null,
      sideProfit: typeof item.sideProfit === "number" ? item.sideProfit : null,
      fireAge: typeof item.fireAge === "number" ? item.fireAge : null
    }))
    .filter((item) => item.month && item.total >= 0)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-18);
}

function ensureBaselineAssetHistory(history) {
  const baseline = normalizeAssetHistory(defaultState.assetHistory);
  const normalized = normalizeAssetHistory(history);
  const merged = [...baseline];

  normalized.forEach((item) => {
    const index = merged.findIndex((existing) => existing.month === item.month);
    if (index >= 0) {
      merged[index] = { ...merged[index], ...item };
    } else {
      merged.push(item);
    }
  });

  return normalizeAssetHistory(merged);
}

function totalAssets() {
  return state.assets.investments + state.assets.cash;
}

function fourPercentFireGoal() {
  const monthlyExpense = Math.max(0, Number(state.profile.monthlyExpense) || 0);
  return monthlyExpense > 0 ? Math.round(monthlyExpense * 12 * 25) : 0;
}

function fireGoalAmount() {
  return fourPercentFireGoal() || Math.max(1, Number(state.profile.fireGoal) || defaultState.profile.fireGoal);
}

function dailyCostAmount() {
  return Math.max(1, Math.round(Number(state.profile.dailyCost) || Number(state.profile.monthlyExpense) / 30 || defaultState.profile.dailyCost));
}

function calculateSavedTime(amount, dailyCost) {
  const safeDailyCost = Math.max(1, Number(dailyCost) || defaultState.profile.dailyCost);
  const totalMinutes = Math.max(0, Math.round((Math.max(0, Number(amount) || 0) / safeDailyCost) * 480));
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60
  };
}

function savedTimeMinutesForAmount(amount) {
  const saved = calculateSavedTime(amount, dailyCostAmount());
  return saved.hours * 60 + saved.minutes;
}

function confirmedActionAmount(entries) {
  return confirmedOutcomeAmount(entries);
}

function totalConfirmedSavedMinutes(period = "lifetime") {
  const entries = period === "today" ? outcomeEntriesFor("today") : outcomeEntriesFor("lifetime");
  return savedTimeMinutesForAmount(confirmedActionAmount(entries));
}

function formatBuybackTime(totalMinutes, options = {}) {
  const minutes = Math.max(0, Math.round(Number(totalMinutes) || 0));
  const prefix = options.signed && minutes > 0 ? "+" : "";
  if (minutes < 60) return `${prefix}${minutes}分`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${prefix}${numberFormatter.format(hours)}時間${rest}分` : `${prefix}${numberFormatter.format(hours)}時間`;
}

function microGoalState() {
  const dailyCost = dailyCostAmount();
  const confirmedAmount = confirmedActionAmount(outcomeEntriesFor("lifetime"));
  const completedDays = Math.floor(confirmedAmount / dailyCost);
  const currentAmount = confirmedAmount % dailyCost;
  const remainingAmount = Math.max(0, dailyCost - currentAmount);
  const progressRate = dailyCost > 0 ? Math.min(100, Math.round((currentAmount / dailyCost) * 100)) : 0;
  return {
    level: completedDays + 1,
    title: `${completedDays + 1}日分の日常を買い戻した`,
    targetAmount: dailyCost,
    currentAmount,
    remainingAmount,
    progressRate
  };
}

function updateTimeBuybackState() {
  state.totalConfirmedSavedTime = totalConfirmedSavedMinutes("lifetime");
  state.currentMicroGoal = microGoalState();
  return state.currentMicroGoal;
}

function fireRate() {
  return Math.min(100, Math.round((totalAssets() / fireGoalAmount()) * 100));
}

function remainingToFire() {
  return Math.max(0, fireGoalAmount() - totalAssets());
}

function nextOnePercentAmount() {
  if (remainingToFire() <= 0) return 0;
  const onePercent = fireGoalAmount() / 100;
  const currentRemainder = totalAssets() % onePercent;
  const amount = currentRemainder === 0 ? onePercent : onePercent - currentRemainder;
  return Math.max(0, Math.ceil(amount));
}

function monthlyDividendAmount() {
  return Math.floor((Number(state.assets.dividends) || 0) / 12);
}

function birthDateValue() {
  if (!state.profile.birthDate) return null;
  const date = new Date(`${state.profile.birthDate}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function currentAgeDecimal(referenceDate = new Date()) {
  const birthDate = birthDateValue();
  if (!birthDate) return Number(state.profile.currentAge) || 29;
  const sourceDate = new Date(referenceDate);
  const reference = new Date(sourceDate.getFullYear(), sourceDate.getMonth(), sourceDate.getDate(), 12);
  const birthMonth = birthDate.getMonth();
  const birthDay = birthDate.getDate();
  let years = reference.getFullYear() - birthDate.getFullYear();
  let lastBirthday = new Date(reference.getFullYear(), birthMonth, birthDay, 12);

  if (reference < lastBirthday) {
    years -= 1;
    lastBirthday = new Date(reference.getFullYear() - 1, birthMonth, birthDay, 12);
  }

  const nextBirthday = new Date(lastBirthday.getFullYear() + 1, birthMonth, birthDay, 12);
  const fraction = (reference.getTime() - lastBirthday.getTime()) / (nextBirthday.getTime() - lastBirthday.getTime());
  return Math.max(0, years + fraction);
}

function currentAgeYears() {
  return Math.floor(currentAgeDecimal());
}

function arrivalAge() {
  const years = yearsToFireDecimal();
  if (typeof years !== "number") return null;
  return roundOne(currentAgeDecimal() + years);
}

function daysToFire() {
  const years = yearsToFireDecimal();
  return typeof years === "number" ? Math.max(0, Math.ceil(years * 365)) : null;
}

function exactSecondsToFire() {
  const years = yearsToFireDecimal();
  return typeof years === "number" ? Math.max(0, Math.round(years * 365 * 24 * 60 * 60)) : null;
}

function fireProjectionSignature() {
  return JSON.stringify({
    totalAssets: totalAssets(),
    investments: Math.max(0, Number(state.assets.investments) || 0),
    cash: Math.max(0, Number(state.assets.cash) || 0),
    fireGoal: fireGoalAmount(),
    monthlyContribution: recurringMonthlyFireContribution(),
    investmentRate: effectiveInvestmentGrowthRate(),
    returnScenario: state.profile.returnScenario,
    annualDividends: Math.max(0, Number(state.assets.dividends) || 0),
    yearlyAssetGrowth: Math.max(0, Number(state.profile.yearlyAssetGrowth) || 0)
  });
}

function yearsToFireDecimal() {
  return compoundYearsToFire();
}

function yearsToTargetAge() {
  return Math.max(0, state.profile.targetAge - currentAgeDecimal());
}

function monthlyProgressEntries() {
  const month = todayKey().slice(0, 7);
  return state.progressEntries.filter((entry) => entry.date.startsWith(month));
}

function todayEntries() {
  return state.progressEntries.filter((entry) => entry.date === todayKey());
}

function progressEntriesForDate(date) {
  return state.progressEntries.filter((entry) => entry.date === date);
}

function selectedProgressDate() {
  return document.getElementById("progressDate")?.value || todayKey();
}

function projectedAnnualFirePower() {
  return state.profile.yearlyAssetGrowth + annualInvestmentContribution() + investmentGrowthAmount() + state.assets.dividends;
}

function recurringMonthlyFireContribution() {
  return Math.max(0, Number(state.profile.monthlyInvestmentAmount) || 0)
    + Math.max(0, Number(state.profile.yearlyAssetGrowth) || 0) / 12
    + Math.max(0, Number(state.assets.dividends) || 0) / 12;
}

function compoundYearsToFire() {
  const target = fireGoalAmount();
  const currentTotal = totalAssets();
  if (!target || currentTotal >= target) return 0;

  const monthlyContribution = recurringMonthlyFireContribution();
  const monthlyRate = effectiveInvestmentGrowthRate() / 100 / 12;
  if (monthlyContribution <= 0 && monthlyRate <= 0) return null;

  let investmentBalance = Math.max(0, Number(state.assets.investments) || 0);
  const cashBalance = Math.max(0, Number(state.assets.cash) || 0);
  const maxMonths = 1200;

  for (let month = 1; month <= maxMonths; month += 1) {
    investmentBalance = investmentBalance * (1 + monthlyRate) + monthlyContribution;
    if (investmentBalance + cashBalance >= target) return roundOne(month / 12);
  }

  return null;
}

function annualFirePower() {
  return Math.max(1, projectedAnnualFirePower());
}

function baseAnnualFirePower() {
  return Math.max(1, state.profile.yearlyAssetGrowth + annualInvestmentContribution() + investmentGrowthAmount() + state.assets.dividends);
}

function fireAgeWithAnnualPower(annualPower) {
  if (annualPower <= 0) return null;
  const yearsLeft = remainingToFire() / Math.max(1, annualPower);
  return roundOne(currentAgeDecimal() + yearsLeft);
}

function daysShortenedByAmount(amount) {
  return Math.max(0, Math.round(signedDaysShortenedByAmount(amount)));
}

function exactDaysShortenedByAmount(amount) {
  return Math.max(0, signedDaysShortenedByAmount(Math.max(0, Number(amount) || 0)));
}

function signedDaysShortenedByAmount(amount) {
  const years = yearsToFireDecimal();
  const remaining = remainingToFire();
  if (typeof years !== "number" || years <= 0 || remaining <= 0) return 0;
  return ((Number(amount) || 0) / remaining) * years * 365;
}

function outcomeEntriesFor(period) {
  if (period === "today") return state.outcomeEntries.filter((entry) => entry.date === todayKey());
  if (period === "month") return state.outcomeEntries.filter((entry) => entry.date.startsWith(currentMonthKey()));
  return state.outcomeEntries;
}

function outcomeEntriesForMonth(month) {
  return state.outcomeEntries.filter((entry) => entry.date.startsWith(month));
}

function outcomeTotals(entries) {
  return entries.reduce((totals, entry) => {
    if (!Object.hasOwn(totals, entry.type)) totals[entry.type] = 0;
    totals[entry.type] += entry.amount;
    totals.sales += entry.sales;
    totals.total += outcomeContribution(entry);
    return totals;
  }, { sales: 0, market: 0, profit: 0, dividend: 0, spending: 0, saving: 0, total: 0 });
}

function outcomeContribution(entry) {
  const rawAmount = Number(entry.amount) || 0;
  const amount = Math.max(0, rawAmount);
  if (entry.type === "market") return rawAmount;
  if (entry.type === "spending") return -amount;
  return amount;
}

function confirmedOutcomeAmount(entries) {
  const totals = outcomeTotals(entries);
  return Math.max(0, totals.profit + totals.saving + totals.dividend);
}

function monthDistanceInclusive(fromMonth, toMonth = currentMonthKey()) {
  const [fromYear, fromMonthNumber] = fromMonth.split("-").map(Number);
  const [toYear, toMonthNumber] = toMonth.split("-").map(Number);
  if (!fromYear || !fromMonthNumber || !toYear || !toMonthNumber) return 1;
  return Math.max(1, (toYear - fromYear) * 12 + toMonthNumber - fromMonthNumber + 1);
}

function trackingStartMonth() {
  const months = [
    currentMonthKey(),
    ...state.outcomeEntries.map((entry) => entry.date?.slice(0, 7)).filter(Boolean),
    ...state.assetHistory.map((entry) => entry.month).filter(Boolean)
  ];
  return months.sort()[0] || currentMonthKey();
}

function confirmedMonthlyPrincipal(period = "month") {
  const monthlyInvestment = Math.max(0, Number(state.profile.monthlyInvestmentAmount) || 0);
  if (period === "today") return confirmedOutcomeAmount(outcomeEntriesFor("today"));
  if (period === "month") return confirmedOutcomeAmount(outcomeEntriesFor("month")) + monthlyInvestment;
  return confirmedOutcomeAmount(outcomeEntriesFor("lifetime")) + monthlyInvestment * monthDistanceInclusive(trackingStartMonth());
}

function monthlyShorteningDays() {
  return exactDaysShortenedByAmount(confirmedMonthlyPrincipal("month"));
}

function todayShorteningDays() {
  return signedDaysShortenedByAmount(confirmedOutcomeAmount(outcomeEntriesFor("today")));
}

function monthlySideProfit(month = currentMonthKey()) {
  return outcomeTotals(outcomeEntriesForMonth(month)).profit;
}

function peerAssetRanking() {
  const dataset = window.JFLEC_ASSET_DATA;
  if (!dataset) return null;

  const ageBand = Math.max(20, Math.min(70, Math.floor(currentAgeYears() / 10) * 10));
  const householdType = state.profile.householdType === "single" ? "single" : "twoPlus";
  const distribution = dataset.distributions[householdType]?.[ageBand];
  if (!distribution) return null;

  const amountInTenThousands = Math.max(0, totalAssets() / 10000);
  const knownTotal = distribution.shares.reduce((sum, share) => sum + share, 0);
  let topShare = knownTotal - distribution.shares[0];
  let isUpperBound = false;

  if (amountInTenThousands > 0) {
    const bucketIndex = dataset.buckets.findIndex((bucket, index) => (
      index > 0
      && amountInTenThousands >= bucket.min
      && (bucket.max === null || amountInTenThousands < bucket.max)
    ));

    if (bucketIndex === dataset.buckets.length - 1) {
      topShare = distribution.shares[bucketIndex];
      isUpperBound = true;
    } else if (bucketIndex > 0) {
      const bucket = dataset.buckets[bucketIndex];
      const higherShare = distribution.shares.slice(bucketIndex + 1).reduce((sum, share) => sum + share, 0);
      const remainingRatio = (bucket.max - amountInTenThousands) / (bucket.max - bucket.min);
      topShare = higherShare + distribution.shares[bucketIndex] * Math.max(0, Math.min(1, remainingRatio));
    }
  }

  return {
    ageBand,
    householdType,
    sample: distribution.sample,
    percent: Math.max(0, Math.min(100, (topShare / knownTotal) * 100)),
    isUpperBound
  };
}

function formatPeerPercentile(ranking) {
  if (!ranking) return "推定 --";
  const percent = ranking.percent < 0.1 ? "0.1%未満" : `${ranking.percent.toFixed(1)}%`;
  return ranking.isUpperBound ? `上位${percent}以内` : `推定 上位${percent}`;
}

function peerAverageAssetAmount(ranking) {
  const dataset = window.JFLEC_ASSET_DATA;
  if (!dataset || !ranking) return null;
  const distribution = dataset.distributions[ranking.householdType]?.[ranking.ageBand];
  if (!distribution) return null;
  const knownTotal = 100 - distribution.unknown;
  if (knownTotal <= 0) return null;

  const weighted = dataset.buckets.reduce((sum, bucket, index) => {
    const midpoint = bucket.max === null ? bucket.min * 1.35 : (bucket.min + bucket.max) / 2;
    return sum + midpoint * distribution.shares[index];
  }, 0);

  return Math.round((weighted / knownTotal) * 10000);
}

function retirementLeadYears() {
  const age = arrivalAge();
  return typeof age === "number" ? roundOne(averageRetirementAge - age) : null;
}

function formatRetirementComparison(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--";
  const years = Math.abs(roundOne(value));
  const formatted = Number.isInteger(years) ? years : years.toFixed(1);
  if (value > 0) return `${formatted}年早い`;
  if (value < 0) return `${formatted}年遅い`;
  return "同じ年齢";
}

function roundOne(value) {
  return Math.round(value * 10) / 10;
}

function formatAge(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--歳";
  const rounded = roundOne(Number(value) || 0);
  return Number.isInteger(rounded) ? `${rounded}歳` : `${rounded.toFixed(1)}歳`;
}

function formatYears(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "--年";
  const rounded = roundOne(Number(value) || 0);
  return Number.isInteger(rounded) ? `${rounded}年` : `${rounded.toFixed(1)}年`;
}

function investmentGrowthAmount() {
  return Math.round(state.assets.investments * (effectiveInvestmentGrowthRate() / 100));
}

function annualInvestmentContribution() {
  return Math.max(0, Math.round((Number(state.profile.monthlyInvestmentAmount) || 0) * 12));
}

function monthlyAssetRateChange() {
  const previousTotal = state.lastMonthlyChange?.previousTotal;
  const diff = state.lastMonthlyChange?.diff;
  if (!previousTotal || typeof diff !== "number") return null;
  return (diff / previousTotal) * 100;
}

function formatPercent(value) {
  if (typeof value !== "number") return "--";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatPrecisePercent(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "+0.00%";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatSignedYen(value) {
  const amount = Number(value) || 0;
  const prefix = amount >= 0 ? "+" : "-";
  return `${prefix}${yen.format(Math.abs(amount))}`;
}

function setSignedText(id, value, text = formatSignedYen(value)) {
  setText(id, text);
  setSignedClass(id, Number(value) || 0);
}

function renderShorteningBasis(todayAmount) {
  const dailyCost = dailyCostAmount();
  const minutes = savedTimeMinutesForAmount(todayAmount);
  setText(
    "shorteningBasisMain",
    `${formatSignedYen(todayAmount)}で${formatBuybackTime(minutes, { signed: true })}買い戻し`
  );
  setSignedClass("shorteningBasisMain", todayAmount);
  setText("shorteningBasisFormula", `${yen.format(dailyCost)} = 8時間として換算`);
  setText(
    "shorteningBasisBreakdown",
    `式: 金額 ÷ 1日の生活費 × 8時間。市場変動は含めません`
  );
}

function nextFreedomHourAmount(todayMinutes) {
  const dailyCost = dailyCostAmount();
  const minutes = Math.max(0, Number(todayMinutes) || 0);
  const nextHour = Math.floor(minutes / 60) + 1;
  const remainingHours = Math.max(0, nextHour - minutes / 60);
  return Math.ceil((dailyCost / 8) * remainingHours);
}

function renderDailyMomentum() {
  const streak = dailyOutcomeStreak();
  const hasTodayEntry = confirmedOutcomeAmount(outcomeEntriesFor("today")) > 0;
  const nextHour = nextFreedomHourAmount(totalConfirmedSavedMinutes("today"));
  setText("streakPill", streak.count ? `${streak.count}日継続` : "今日から開始");
  setText(
    "dailyMomentumMessage",
    hasTodayEntry
      ? `次の+1時間短縮まであと${yen.format(nextHour)}`
      : streak.count
        ? `今日1件記録で${streak.count}日継続を維持。次の+1時間短縮まで${yen.format(nextHour)}`
        : `まずは成果を1件記録。次の+1時間短縮まで${yen.format(nextHour)}`
  );
}

function todayAssetChange() {
  return outcomeTotals(outcomeEntriesFor("today")).total;
}

function todayAssetChangeRate() {
  const total = totalAssets();
  if (!total) return 0;
  return (todayAssetChange() / total) * 100;
}

function padClock(value) {
  return String(value).padStart(2, "0");
}

function fireCountdownDisplayOffsetMs() {
  return Math.max(0, totalConfirmedSavedMinutes("lifetime")) * 60 * 1000;
}

function formatFireCountdown(totalMs) {
  const milliseconds = Math.max(0, Math.floor(Number(totalMs) || 0));
  const seconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(seconds / 86400);
  const rest = seconds % 86400;
  const hours = Math.floor(rest / 3600);
  const minutes = Math.floor((rest % 3600) / 60);
  const remainingSeconds = rest % 60;
  return `${numberFormatter.format(days)}日\n${padClock(hours)}時間${padClock(minutes)}分${padClock(remainingSeconds)}秒`;
}

function showFireCountdownImpact(minutes) {
  const impact = document.getElementById("fireCountdownImpact");
  const time = document.getElementById("fireCountdownImpactTime");
  if (!impact || !time) return;
  const safeMinutes = Math.max(0, Math.round(Number(minutes) || 0));
  if (!safeMinutes) return;
  time.textContent = `−${formatBuybackTime(safeMinutes)}`;
  impact.hidden = false;
  impact.classList.remove("is-visible");
  void impact.offsetWidth;
  impact.classList.add("is-visible");
}

function showDailyCountdownAction(animate = true) {
  const element = document.getElementById("dailyCountdownAction");
  if (!element) return;
  element.hidden = false;
  element.classList.remove("is-visible", "is-settled");
  if (!animate) {
    element.classList.add("is-settled");
    return;
  }
  void element.offsetWidth;
  element.classList.add("is-visible");
  window.clearTimeout(dailyCountdownActionTimer);
  dailyCountdownActionTimer = window.setTimeout(() => {
    element.classList.add("is-settled");
  }, 3600);
}

function maybeTriggerDailyCountdownAction() {
  if (fireCountdownTargetAt === null) return;
  const date = todayKey();
  if (state.lastCountdownActionDate === date) {
    const element = document.getElementById("dailyCountdownAction");
    if (element?.hidden) showDailyCountdownAction(false);
    return;
  }
  state.lastCountdownActionDate = date;
  saveState();
  showDailyCountdownAction();
}

function updateFireCountdown() {
  if (fireCountdownTargetAt === null) {
    setText("fireDistanceHero", "計画未設定\n積立額を入力");
    const action = document.getElementById("dailyCountdownAction");
    if (action) action.hidden = true;
    return;
  }
  const remainingMs = Math.max(0, fireCountdownTargetAt - Date.now() - fireCountdownDisplayOffsetMs());
  setText("fireDistanceHero", formatFireCountdown(remainingMs));
  maybeTriggerDailyCountdownAction();
}

function renderFireProjection() {
  fireCountdownBaseSeconds = exactSecondsToFire();
  if (fireCountdownBaseSeconds === null) {
    fireCountdownTargetAt = null;
    state.fireCountdownPlan = null;
    forceFireCountdownReplan = false;
  } else {
    const signature = fireProjectionSignature();
    const savedPlan = normalizeFireCountdownPlan(state.fireCountdownPlan);
    const nextTargetAt = Date.now() + fireCountdownBaseSeconds * 1000;
    if (!forceFireCountdownReplan && savedPlan && savedPlan.targetAt > Date.now()) {
      fireCountdownTargetAt = Math.min(savedPlan.targetAt, nextTargetAt);
    } else {
      fireCountdownTargetAt = nextTargetAt;
    }
    state.fireCountdownPlan = { signature, targetAt: fireCountdownTargetAt };
    forceFireCountdownReplan = false;
    saveState();
  }
  updateFireCountdown();
  const monthlyShortening = monthlyShorteningDays();
  const leadYears = retirementLeadYears();
  const years = yearsToFireDecimal();
  setText("fireYearsHero", typeof years === "number" ? `約${years.toFixed(1)}年` : "積立額を入力");
  setText("arrivalAge", formatAge(arrivalAge()));
  setText("monthlyShortening", formatShortening(monthlyShortening));
  setText("investmentGrowthAmount", yen.format(investmentGrowthAmount()));
  setText("effectiveGrowthRate", `${effectiveInvestmentGrowthRate()}%`);
  setText("effectiveFireGoal", yen.format(fireGoalAmount()));
  setText("growthRateNote", growthRateNoteText());
  setText("retirementLead", formatRetirementComparison(leadYears));
  setText("currentAgeDisplay", formatAge(currentAgeYears()));
  setText("fourPercentGoalDisplay", fourPercentFireGoal() ? yen.format(fourPercentFireGoal()) : "月間支出を入力");
  setPositiveNegativeClass("monthlyShortening", monthlyShortening);
  setPositiveNegativeClass("retirementLead", leadYears);
}

function render() {
  applyScheduledDividendEntries();
  const total = totalAssets();
  const rate = fireRate();
  const monthlySavings = outcomeTotals(outcomeEntriesFor("month")).saving;
  const todayTotals = outcomeTotals(outcomeEntriesFor("today"));
  const todayChange = todayTotals.total;
  const todayConfirmedAmount = confirmedOutcomeAmount(outcomeEntriesFor("today"));
  const yearly = yearlyComparison();
  const microGoal = updateTimeBuybackState();
  const todayBuybackMinutes = totalConfirmedSavedMinutes("today");

  setText("fireRate", `${rate}%`);
  setText("heroTitle", state.profile.heroTitle || defaultState.profile.heroTitle);
  setText("totalBuybackDays", `人生累計 ${formatBuybackTime(state.totalConfirmedSavedTime)}`);
  setText("todayBuybackTime", formatBuybackTime(todayBuybackMinutes, { signed: true }));
  setText("microGoalLevel", `Lv.${microGoal.level}`);
  setText("microGoalTitle", `${microGoal.title}（${yen.format(microGoal.targetAmount)}）`);
  setText("microGoalProgressLabel", `${microGoal.progressRate}%`);
  setText("microGoalRemaining", `あと${yen.format(microGoal.remainingAmount)}で${microGoal.level}日分`);
  setText("buybackBasis", `1日 ${yen.format(dailyCostAmount())} = 8時間`);
  const microGoalProgress = document.getElementById("microGoalProgress");
  if (microGoalProgress) microGoalProgress.style.width = `${microGoal.progressRate}%`;
  setText("totalAssets", yen.format(total));
  setText("heroTotalAssets", yen.format(total));
  setSignedText("heroTodayAssetChange", todayChange);
  setSignedText("heroTodayAssetRate", todayChange, `(${formatPrecisePercent(todayAssetChangeRate())})`);
  setSignedText("todayMarketChange", todayTotals.market);
  setSignedText("todayProfitChange", todayTotals.profit);
  setSignedText("todaySavingChange", todayTotals.saving);
  setSignedText("todayDividendChange", todayTotals.dividend);
  setSignedText("todaySpendingChange", -todayTotals.spending);
  setText("annualDividendResult", yen.format(state.assets.dividends));
  setText("annualDividendPower", `${yen.format(state.assets.dividends)}/年`);
  const sideProfit = monthlySideProfit();
  setText("monthlySideProfitResult", yen.format(sideProfit));
  setText("heroMonthlySideProfit", yen.format(sideProfit));
  setText("monthlySavingResult", yen.format(monthlySavings));
  setText("yearlyAssetDiffResult", formatDiff(yearly.assetDiff));
  const peerRanking = peerAssetRanking();
  const peerAverage = peerAverageAssetAmount(peerRanking);
  const householdLabel = peerRanking?.householdType === "single" ? "単身世帯" : "二人以上世帯";
  setText("peerBenchmarkSummary", peerRanking ? `${peerRanking.ageBand}歳代・${householdLabel}と比較` : "同年代の金融資産分布と比較");
  setText("peerPercentile", formatPeerPercentile(peerRanking));
  setText("peerAverageDiff", peerAverage ? formatDiff(total - peerAverage) : "--");
  setText("peerRatio", peerAverage ? `${roundOne(total / Math.max(1, peerAverage))}倍` : "--倍");
  setText("peerBenchmarkNote", peerRanking ? `回答${numberFormatter.format(peerRanking.sample)}世帯 / 総資産を金融資産として階級内を均等推定` : "金融資産ベース・未回答を除く推定値");
  const yearsToFire = yearsToFireDecimal();
  setText("resultYearsToFire", typeof yearsToFire === "number" ? `約${yearsToFire.toFixed(1)}年` : "積立額を入力");
  setText("resultFireAge", formatAge(arrivalAge()));
  const todayImpact = todayShorteningDays();
  const shortening = monthlyShorteningDays();
  setText("confirmedLifetimeShortening", formatBuybackTime(state.totalConfirmedSavedTime));
  setText(
    "fireShortenMessage",
    todayImpact > 0
      ? `今日、自由まで${formatSignedImpact(todayImpact)}近づいた`
      : shortening > 0
        ? `今月、FIREを${formatShortening(shortening)}短縮`
        : ""
  );
  setText("targetAge", `${state.profile.targetAge}歳`);
  setText("monthlyAssetDiff", formatDiff(state.lastMonthlyChange?.diff));
  setText("monthlyAssetRate", formatPercent(monthlyAssetRateChange()));
  setText("settingsMonthlyDiff", formatDiff(state.lastMonthlyChange?.diff));
  setText("monthlyAutoLabel", `${formatCurrentMonthLabel()}として自動記録`);
  const monthlyFireAgeDiff = monthlyComparison().fireAgeDiffValue;
  setText("monthlyFireDelta", formatFireDaysDiff(monthlyFireAgeDiff));
  setSignedText("todayShortening", todayImpact, formatSignedImpact(todayImpact));
  renderShorteningBasis(todayConfirmedAmount, todayImpact);
  renderDailyStreak();
  renderDailyMomentum();
  const yearlyShortening = yearlyShorteningDays();
  setText("yearlyShortening", formatShortening(yearlyShortening));
  setText("nextOnePercentAmount", nextOnePercentAmount() ? `あと${yen.format(nextOnePercentAmount())}` : "達成済み");
  setSignedClass("monthlyAssetDiff", state.lastMonthlyChange?.diff);
  setSignedClass("monthlyAssetRate", monthlyAssetRateChange());
  setSignedClass("yearlyAssetDiffResult", yearly.assetDiff);
  setSignedClass("peerAverageDiff", peerAverage ? total - peerAverage : null);
  setPositiveNegativeClass("monthlyFireDelta", monthlyFireAgeDiff);
  setPositiveNegativeClass("yearlyShortening", yearlyShortening);
  renderResultHighlights();
  setText("fireProgressLabel", `${rate}%`);
  document.getElementById("fireProgress").style.width = `${rate}%`;
  renderFireProjection();
  hydrateDateInputs();

  renderSideHustles();
  renderDividendPower();
  renderOutcomeQuickActions();
  renderCustomizationSettings();
  renderInvestmentHoldings();
  renderOutcomeFormOptions();
  renderOutcomeHistory();
  renderAssets();
  renderAssetTrend();
  renderJourney();
  hydrateSettings();
  switchView(currentView);
}

function formatCurrentMonthLabel() {
  const [year, month] = currentMonthKey().split("-");
  return `${year}年${Number(month)}月`;
}

function setSignedClass(id, value) {
  const element = document.getElementById(id);
  if (!element) return;
  element.classList.remove("is-plus", "is-minus");
  if (typeof value !== "number" || value === 0) return;
  element.classList.add(value > 0 ? "is-plus" : "is-minus");
}

function setPositiveNegativeClass(id, value) {
  setSignedClass(id, typeof value === "number" ? value : null);
}

function setResultCardState(id, stateName) {
  const element = document.getElementById(id);
  const card = element?.closest(".result-grid > div, .result-hero");
  if (!card) return;
  card.classList.remove("is-good", "is-bad");
  if (stateName) card.classList.add(stateName);
}

function renderResultHighlights() {
  const total = totalAssets();
  const peerRanking = peerAssetRanking();
  const peerAverage = peerAverageAssetAmount(peerRanking);
  const yearsToFire = yearsToFireDecimal();
  const fireAge = arrivalAge();
  const leadYears = retirementLeadYears();
  const yearly = yearlyComparison();
  const sideProfit = monthlySideProfit();
  const monthlySavings = outcomeTotals(outcomeEntriesFor("month")).saving;

  setResultCardState("totalAssets", total > 0 ? "is-good" : null);
  setResultCardState("peerPercentile", peerRanking && peerRanking.percent <= 50 ? "is-good" : null);
  setResultCardState("peerRatio", peerAverage && total > peerAverage ? "is-good" : null);
  setResultCardState("peerAverageDiff", peerAverage ? (total > peerAverage ? "is-good" : total < peerAverage ? "is-bad" : null) : null);
  setResultCardState("resultYearsToFire", typeof yearsToFire === "number" && yearsToFire <= yearsToTargetAge() ? "is-good" : null);
  setResultCardState("resultFireAge", typeof fireAge === "number" && fireAge <= state.profile.targetAge ? "is-good" : null);
  setResultCardState("annualDividendResult", state.assets.dividends > 0 ? "is-good" : null);
  setResultCardState("monthlySideProfitResult", sideProfit > 0 ? "is-good" : null);
  setResultCardState("monthlySavingResult", monthlySavings > 0 ? "is-good" : null);
  setResultCardState("yearlyAssetDiffResult", yearly.assetDiff > 0 ? "is-good" : yearly.assetDiff < 0 ? "is-bad" : null);
  setResultCardState("retirementLead", leadYears > 0 ? "is-good" : leadYears < 0 ? "is-bad" : null);
}

function dailyOutcomeStreak() {
  const actionDates = new Set(
    state.outcomeEntries
      .filter((entry) => ["profit", "saving"].includes(entry.type) && outcomeContribution(entry) > 0)
      .map((entry) => entry.date)
  );

  function countBackFrom(date) {
    const cursor = new Date(`${date}T12:00:00`);
    let count = 0;
    while (actionDates.has(formatDateKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  const todayCount = countBackFrom(todayKey());
  if (todayCount > 0) return { count: todayCount, includesToday: true };

  const yesterday = new Date(`${todayKey()}T12:00:00`);
  yesterday.setDate(yesterday.getDate() - 1);
  return { count: countBackFrom(formatDateKey(yesterday)), includesToday: false };
}

function renderDailyStreak() {
  const streak = dailyOutcomeStreak();
  setText("dailyStreak", `${streak.count}日`);
  setText(
    "dailyStreakLabel",
    streak.count
      ? streak.includesToday ? "今日も継続中" : `昨日まで${streak.count}日`
      : "今日の成果待ち"
  );
  setPositiveNegativeClass("dailyStreak", streak.count);
}

function formatShortening(days) {
  if (days < 1) return formatImpactDays(days);
  if (days >= 365) return `${(days / 365).toFixed(1)}年`;
  return `${Math.round(days)}日`;
}

function formatCompactYen(value) {
  const amount = Number(value) || 0;
  if (Math.abs(amount) >= 100000000) return `¥${(amount / 100000000).toFixed(1)}億`;
  if (Math.abs(amount) >= 10000) return `¥${Math.round(amount / 10000)}万`;
  return yen.format(amount);
}

function renderTodayQuests() {
  const list = document.getElementById("todayQuestList");
  const date = selectedProgressDate();
  const entries = progressEntriesForDate(date);

  if (!entries.length) {
    list.innerHTML = `
      <div class="today-empty">
        <strong>${date === todayKey() ? "まだ今日の前進はありません" : `${formatEntryDate(date)}の前進はありません`}</strong>
        <span>日付を選んで過去の前進も記録できます</span>
      </div>
    `;
    return;
  }

  list.innerHTML = entries
    .map((entry) => `
      <div class="today-quest-item">
        <span class="check-mark">OK</span>
        <div>
          <strong>${escapeHtml(entry.text)}</strong>
          <small>${formatEntryDate(entry.date)} 自動記録</small>
        </div>
        <button class="delete-progress" type="button" data-delete-progress="${escapeHtml(entry.id)}" aria-label="${escapeHtml(entry.text)}を削除">削除</button>
      </div>
    `)
    .join("");
}

function setText(id, text) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = text;
}

function dividendPurchaseStatus(annualDividend, item) {
  const count = Math.floor(annualDividend / item.cost);
  if (count >= 1) return { className: "is-full", label: `年${count}${item.unit}` };

  const remaining = Math.max(0, item.cost - annualDividend);
  return {
    className: annualDividend >= item.cost * 0.5 ? "is-partial" : "is-low",
    label: `あと${yen.format(remaining)}`
  };
}

function renderDividendPower() {
  const container = document.getElementById("dividendPowerList");
  if (!container) return;

  const annualDividend = Math.max(0, Number(state.assets.dividends) || 0);
  const items = state.dividendGoals;

  if (!items.length) {
    container.innerHTML = '<p class="outcome-empty">設定で「配当で叶えたいこと」を追加できます</p>';
    return;
  }

  container.innerHTML = items.map((item) => {
    const status = dividendPurchaseStatus(annualDividend, { ...item, unit: "回" });
    return `
      <div class="dividend-power-row ${status.className}">
        <span>${item.label}</span>
        <small>${yen.format(item.cost)}</small>
        <strong>${status.label}</strong>
      </div>
    `;
  }).join("");
}

function renderQuickActions() {
  const container = document.getElementById("quickActions");
  if (!container) return;
  if (!state.quickActions.length) {
    container.innerHTML = '<p class="quick-actions-empty">設定でワンタップ前進を追加できます</p>';
    return;
  }

  container.innerHTML = state.quickActions
    .map((item) => `
      <button type="button" data-quick-action-id="${escapeHtml(item.id)}">
        ${escapeHtml(item.label)}
      </button>
    `)
    .join("");
}

function renderOutcomeQuickActions() {
  const container = document.getElementById("outcomeQuickActions");
  if (!container) return;
  if (!state.outcomeQuickActions.length) {
    container.innerHTML = '<p class="quick-actions-empty">設定で成果ボタンを追加できます</p>';
    return;
  }

  container.innerHTML = state.outcomeQuickActions
    .map((item) => `
      <button type="button" data-outcome-quick-id="${escapeHtml(item.id)}">
        ${escapeHtml(item.label)}
      </button>
    `)
    .join("");
}

function holdingPresetOptions(selectedSymbol) {
  const filtered = filteredHoldingPresets(selectedSymbol);
  return filtered
    .map((preset) => `<option value="${escapeHtml(preset.symbol)}" ${preset.symbol === selectedSymbol ? "selected" : ""}>${escapeHtml(holdingPresetLabel(preset))}</option>`)
    .join("");
}

function holdingPresetLabel(preset) {
  return preset.name;
}

function filteredHoldingPresets(selectedSymbol = "") {
  const query = normalizeSearchText(holdingSearchQuery);
  const matches = holdingPresets.filter((preset) => {
    const categoryMatched = holdingFilterType === "all" || preset.category === holdingFilterType || preset.symbol === selectedSymbol;
    if (!categoryMatched) return false;
    if (!query) return true;
    return holdingPresetMatchesQuery(preset, query) || preset.symbol === selectedSymbol;
  });
  const selectedPreset = holdingPresets.find((preset) => preset.symbol === selectedSymbol);
  if (selectedPreset && !matches.some((preset) => preset.symbol === selectedPreset.symbol)) {
    matches.unshift(selectedPreset);
  }
  return matches.sort((a, b) => (Number(a.rank) || 999) - (Number(b.rank) || 999) || a.name.localeCompare(b.name, "ja"));
}

function holdingPresetMatchesQuery(preset, query) {
  const targets = [
    preset.name,
    preset.symbol,
    tickerBody(preset.ticker),
    preset.broker,
    ...(preset.aliases || [])
  ].map(normalizeSearchText).filter(Boolean);

  if (query.length === 1) {
    return targets.some((target) => target.startsWith(query));
  }

  return targets.some((target) => target.includes(query));
}

function tickerBody(ticker) {
  return String(ticker || "").split(":").pop();
}

function holdingSearchCandidates() {
  return filteredHoldingPresets()
    .filter((preset) => preset.symbol !== "custom")
    .slice(0, holdingSearchQuery.trim() ? 8 : 5);
}

function normalizeSearchText(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, "");
}

function holdingValueFromRow(row) {
  return parseInputNumber(row.querySelector("[data-holding-field='value']")?.value || "");
}

function isCryptoHolding(item) {
  return item?.category === "crypto" || item?.source === "coingecko";
}

function updateHoldingDraftTotals() {
  const rows = [...document.querySelectorAll("[data-holding-row]")];
  let total = 0;
  rows.forEach((row) => {
    const value = holdingValueFromRow(row);
    total += value;
  });
  setText("holdingsTotal", yen.format(total));
}

function scheduleInvestmentHoldingsAutoSave() {
  window.clearTimeout(holdingsAutoSaveTimer);
  holdingsAutoSaveTimer = window.setTimeout(() => {
    saveInvestmentHoldings({ silent: true });
  }, 650);
}

function confirmDelete(message) {
  return window.confirm(message);
}

function renderInvestmentHoldings() {
  const list = document.getElementById("investmentHoldingsList");
  if (!list) return;
  const filter = document.getElementById("holdingCategoryFilter");
  const search = document.getElementById("holdingSearchInput");
  if (filter) filter.value = holdingFilterType;
  if (search && search.value !== holdingSearchQuery) search.value = holdingSearchQuery;
  const holdings = state.investmentHoldings.length
    ? state.investmentHoldings
    : normalizeInvestmentHoldings([], state.assets);
  const total = holdings.reduce((sum, item) => sum + item.value, 0);
  const topHoldings = [...holdings]
    .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
    .slice(0, 3);
  const displayHoldings = activeHoldingId && !topHoldings.some((item) => item.id === activeHoldingId)
    ? [...topHoldings.slice(0, 2), holdings.find((item) => item.id === activeHoldingId)].filter(Boolean)
    : topHoldings;
  const hiddenCount = Math.max(0, holdings.length - displayHoldings.length);

  setText("holdingsTotal", yen.format(total));
  setText("holdingsSummary", `上位${displayHoldings.length}件 / ${holdings.length}件`);
  renderHoldingSearchResults();
  list.innerHTML = displayHoldings
    .map((item) => {
      const crypto = isCryptoHolding(item);
      const priceNote = crypto && item.price ? ` / ${yen.format(item.price)}` : "";
      return `
      <div class="holding-row ${crypto ? "is-crypto" : ""}" data-holding-row="${escapeHtml(item.id)}" data-holding-price="${escapeHtml(String(item.price || ""))}" data-holding-price-updated-at="${escapeHtml(item.priceUpdatedAt || "")}">
        <label>
          <span>銘柄</span>
          <select data-holding-field="symbol">
            ${holdingPresetOptions(item.symbol)}
          </select>
        </label>
        ${crypto ? `
        <label>
          <span>保有数量</span>
          <input data-holding-field="quantity" type="text" inputmode="decimal" data-decimal-input value="${formatDecimalInput(item.quantity)}" placeholder="0.0000" />
        </label>
        ` : ""}
        <label>
          <span>${crypto ? `円評価額${priceNote}` : "現在の評価額"}</span>
          <input data-holding-field="value" type="text" inputmode="numeric" data-number-input value="${formatInputNumber(item.value)}" placeholder="0" />
        </label>
        <button type="button" data-delete-holding="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.name)}を削除">削除</button>
      </div>
    `;
    })
    .join("") + (hiddenCount ? `<p class="holdings-note compact">他${hiddenCount}件は保存済みです。上位3銘柄だけ表示しています。</p>` : "");
}

function renderHoldingSearchResults() {
  const container = document.getElementById("holdingSearchResults");
  if (!container) return;
  const candidates = holdingSearchCandidates();
  const hasQuery = Boolean(holdingSearchQuery.trim());

  if (!candidates.length) {
    container.innerHTML = hasQuery
      ? '<p class="holding-result-empty">検索結果無し</p>'
      : '<p class="holding-result-empty">検索すると候補が表示されます</p>';
    return;
  }

  container.innerHTML = `
    <div class="holding-result-head">
      <span>${hasQuery ? "検索候補" : "ランキング上位"}</span>
      <small>タップで追加</small>
    </div>
    <div class="holding-result-list">
      ${candidates.map((preset) => `
        <button type="button" data-add-holding-preset="${escapeHtml(preset.symbol)}">
          <strong>${escapeHtml(preset.name)}</strong>
          <small>${escapeHtml([preset.broker, preset.ticker].filter(Boolean).join(" / "))}</small>
        </button>
      `).join("")}
    </div>
  `;
}

function renderCustomizationSettings() {
  const outcomeQuickList = document.getElementById("outcomeQuickSettingsList");
  const quickList = document.getElementById("quickActionSettingsList");
  const rewardList = document.getElementById("dividendGoalSettingsList");
  const victoryList = document.getElementById("victoryGoalSettingsList");

  if (outcomeQuickList) {
    outcomeQuickList.innerHTML = state.outcomeQuickActions.length
      ? state.outcomeQuickActions.map((item) => `
        <div class="custom-setting-row outcome-quick-setting-row" data-outcome-quick-setting="${escapeHtml(item.id)}">
          <label><span>種類</span><select data-outcome-quick-field="type"><option value="profit" ${item.type === "profit" ? "selected" : ""}>副業</option><option value="saving" ${item.type === "saving" ? "selected" : ""}>節約</option></select></label>
          <label><span>表示名</span><input data-outcome-quick-field="label" value="${escapeHtml(item.label)}" maxlength="18" /></label>
          <label><span>内容</span><input data-outcome-quick-field="category" value="${escapeHtml(item.category)}" maxlength="24" /></label>
          <label><span>金額</span><input data-outcome-quick-field="amount" type="text" inputmode="numeric" data-number-input value="${formatInputNumber(item.amount)}" /></label>
          <button class="delete-custom-item" type="button" data-delete-outcome-quick="${escapeHtml(item.id)}">削除</button>
        </div>
      `).join("")
      : '<p class="custom-empty">成果ボタンは未設定です</p>';
  }

  if (quickList) {
    quickList.innerHTML = state.quickActions.length
      ? state.quickActions.map((item) => `
        <div class="custom-setting-row" data-quick-setting="${escapeHtml(item.id)}">
          <label><span>表示名</span><input data-quick-field="label" value="${escapeHtml(item.label)}" maxlength="16" /></label>
          <label><span>記録内容</span><input data-quick-field="text" value="${escapeHtml(item.text)}" maxlength="40" /></label>
          <button class="delete-custom-item" type="button" data-delete-quick-action="${escapeHtml(item.id)}">削除</button>
        </div>
      `).join("")
      : '<p class="custom-empty">ワンタップ前進は未設定です</p>';
  }

  rewardList.innerHTML = state.dividendGoals.length
    ? state.dividendGoals.map((item) => `
      <div class="custom-setting-row reward-setting-row" data-reward-setting="${escapeHtml(item.id)}">
        <label><span>叶えたいこと</span><input data-reward-field="label" value="${escapeHtml(item.label)}" maxlength="24" /></label>
        <label><span>必要金額</span><input data-reward-field="cost" type="text" inputmode="numeric" data-number-input value="${formatInputNumber(item.cost)}" /></label>
        <button class="delete-custom-item" type="button" data-delete-dividend-goal="${escapeHtml(item.id)}">削除</button>
      </div>
    `).join("")
    : '<p class="custom-empty">配当で叶えたいことは未設定です</p>';

  if (victoryList) {
    victoryList.innerHTML = state.victoryGoals.length
      ? state.victoryGoals.map((item) => `
        <div class="custom-setting-row victory-setting-row" data-victory-setting="${escapeHtml(item.id)}">
          <label><span>表示名</span><input data-victory-field="label" value="${escapeHtml(item.label)}" maxlength="20" /></label>
          <label>
            <span>種類</span>
            <select data-victory-field="metric">
              <option value="profit" ${item.metric === "profit" ? "selected" : ""}>副業利益</option>
              <option value="saving" ${item.metric === "saving" ? "selected" : ""}>節約</option>
              <option value="assetGrowth" ${item.metric === "assetGrowth" ? "selected" : ""}>資産増加</option>
            </select>
          </label>
          <label><span>目標値</span><input data-victory-field="target" type="text" inputmode="numeric" data-number-input value="${formatInputNumber(item.target)}" /></label>
          <button class="delete-custom-item" type="button" data-delete-victory-goal="${escapeHtml(item.id)}">削除</button>
        </div>
      `).join("")
      : '<p class="custom-empty">条件は未設定です</p>';
  }
}

function renderSideHustles() {
  const list = document.getElementById("sideHustleList");
  const today = outcomeTotals(outcomeEntriesFor("today"));
  const monthEntries = outcomeTotals(outcomeEntriesFor("month"));
  const lifetimeMinutes = totalConfirmedSavedMinutes("lifetime");

  list.innerHTML = `
    ${renderImpactPeriod("今日の成果", today, "today")}
    ${renderImpactPeriod("今月累計", monthEntries, "month")}
    <div class="impact-lifetime">
      <small>人生累計（記録開始から）</small>
      <span>確定短縮時間</span>
      <strong>${formatBuybackTime(lifetimeMinutes)}</strong>
    </div>
    <p class="impact-note">市場変動を除き、副業利益・節約額・配当だけで積み上げ</p>
  `;

}

function renderImpactPeriod(title, totals, period) {
  const principal = confirmedOutcomeAmount(period === "month" ? outcomeEntriesFor("month") : outcomeEntriesFor("today"));
  const minutes = savedTimeMinutesForAmount(principal);
  return `
    <section class="impact-period ${period === "today" ? "is-today" : ""}">
      <h3>${title}</h3>
      <div><span>副業利益</span><strong>+${yen.format(totals.profit)}</strong></div>
      <div><span>節約</span><strong>+${yen.format(totals.saving)}</strong></div>
      <div><span>配当</span><strong>+${yen.format(totals.dividend)}</strong></div>
      <div class="impact-total"><span>確定成果</span><strong>+${yen.format(principal)}</strong></div>
      <div class="impact-fire"><span>買い戻した自由</span><strong>${formatBuybackTime(minutes, { signed: true })}</strong></div>
    </section>
  `;
}

function formatImpactDays(days) {
  if (!Number.isFinite(days) || days <= 0) return "0分";
  if (days < 1) {
    const rawMinutes = days * 24 * 60;
    if (rawMinutes < 1) return "1分未満";
    const totalMinutes = Math.round(rawMinutes);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (!hours) return `${minutes}分`;
    return minutes ? `${hours}時間${minutes}分` : `${hours}時間`;
  }
  return `${days.toFixed(1)}日`;
}

function formatSignedImpact(days) {
  const value = Number(days) || 0;
  if (!value) return "+0分";
  const prefix = value > 0 ? "+" : "-";
  return `${prefix}${formatImpactDays(Math.abs(value))}`;
}

function formatLifetimeShortening(days) {
  if (days < 30) return formatImpactDays(days);
  const totalMonths = Math.floor(days / 30.4375);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (!years) return `${months}ヶ月`;
  return months ? `${years}年${months}ヶ月` : `${years}年`;
}

function renderOutcomeFormOptions() {
  const form = document.getElementById("outcomeForm");
  const type = Object.hasOwn(outcomeCategories, form.elements.type.value) ? form.elements.type.value : "profit";
  document.getElementById("outcomeCategorySuggestions").innerHTML = outcomeCategories[type]
    .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    .join("");
  const placeholders = {
    market: "例: 投資評価額",
    profit: "例: 商品販売",
    dividend: "例: 株式配当",
    spending: "例: 外食",
    saving: "例: 買い物を見送った"
  };
  const amountLabels = {
    market: "増減額",
    profit: "利益",
    dividend: "配当",
    spending: "支出額",
    saving: "節約額"
  };
  form.elements.category.placeholder = placeholders[type] || "内容を入力";
  setText("outcomeAmountLabel", amountLabels[type] || "金額");
}

function renderOutcomeHistory() {
  const container = document.getElementById("outcomeHistory");
  const entries = state.outcomeEntries
    .filter((entry) => entry.type !== "market")
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  if (!entries.length) {
    container.innerHTML = '<p class="outcome-empty">成果を記録すると、FIRE短縮がここに積み上がります</p>';
    return;
  }
  const renderRows = (items) => items.map((entry) => {
    const contribution = outcomeContribution(entry);
    const signedClass = getSignedClass(contribution);
    const typeClass = entry.type === "spending" ? " is-spending" : "";
    return `
    <div class="outcome-row${typeClass}">
      <div class="outcome-main">
        <strong>${escapeHtml(entry.category)}</strong>
        <small>${formatEntryDate(entry.date)}・${outcomeTypeLabels[entry.type] || "成果"}</small>
      </div>
      <div class="outcome-values">
        <span class="${signedClass}">${formatSignedYen(contribution)}</span>
        <b class="${signedClass}">${formatBuybackTime(savedTimeMinutesForAmount(contribution), { signed: true })}</b>
      </div>
      <button type="button" data-delete-outcome="${escapeHtml(entry.id)}" aria-label="${escapeHtml(entry.category)}を削除">削除</button>
    </div>
  `;
  }).join("");
  const visibleEntries = entries.slice(0, 3);
  const olderEntries = entries.slice(3);
  container.innerHTML = `
    <div class="outcome-history-head">
      <small>直近3件</small>
      <span>${entries.length}件</span>
    </div>
    ${renderRows(visibleEntries)}
    ${olderEntries.length ? `
      <details class="outcome-history-more">
        <summary>過去の成果 ${olderEntries.length}件を表示</summary>
        ${renderRows(olderEntries)}
      </details>
    ` : ""}
  `;
}

function renderJourney() {
  document.getElementById("monthlyCompareList").innerHTML = comparisonRows(monthlyComparison())
    .map(renderCompareRow)
    .join("");
  document.getElementById("yearlyCompareList").innerHTML = comparisonRows(yearlyComparison())
    .map(renderCompareRow)
    .join("");

  const journal = heroJournal();
  setText("journalTitle", journal.title);
  setText("journalBody", journal.body);
}

function comparisonRows(data) {
  return [
    { label: "資産", current: yen.format(totalAssets()), diff: formatDiff(data.assetDiff), value: data.assetDiff, empty: data.empty },
    { label: "年間配当", current: yen.format(state.assets.dividends), diff: formatDiff(data.dividendDiff), value: data.dividendDiff, empty: data.empty },
    { label: "副業利益", current: yen.format(monthlySideProfit()), diff: formatDiff(data.sideProfitDiff), value: data.sideProfitDiff, empty: data.empty },
    { label: "FIRE年齢", current: formatAge(arrivalAge()), diff: data.fireAgeDiffText, value: data.fireAgeDiffValue, empty: data.empty }
  ];
}

function renderCompareRow(row) {
  if (row.empty) {
    return `
      <div class="compare-row muted-row">
        <span>${row.label}</span>
        <strong>${row.current}</strong>
        <b>記録待ち</b>
      </div>
    `;
  }

  return `
    <div class="compare-row">
      <span>${row.label}</span>
      <strong>${row.current}</strong>
      <b class="${signedClass(row.value)}">${row.diff}</b>
    </div>
  `;
}

function signedClass(value) {
  if (typeof value !== "number" || value === 0) return "";
  return value > 0 ? "is-plus" : "is-minus";
}

function monthlyComparison() {
  const currentProfit = monthlySideProfit();
  const previousProfit = monthlySideProfit(previousMonthKey(currentMonthKey()));
  const previousSnapshot = findSnapshot(previousMonthKey(currentMonthKey()));
  const previousFireAge = previousSnapshot?.fireAge || roundOne(arrivalAge() + Math.max(0, monthlyShorteningDays() / 365));
  const fireAgeDiff = arrivalAge() - previousFireAge;

  return {
    empty: !state.lastMonthlyChange && !previousSnapshot,
    assetDiff: state.lastMonthlyChange?.diff ?? diffFromSnapshot(previousSnapshot, "total", totalAssets()),
    dividendDiff: diffFromSnapshot(previousSnapshot, "dividends", state.assets.dividends),
    sideProfitDiff: currentProfit - previousProfit,
    fireAgeDiffText: formatFireAgeDiff(fireAgeDiff),
    fireAgeDiffValue: -fireAgeDiff
  };
}

function yearlyComparison() {
  const snapshot = findSnapshot(yearAgoMonthKey()) || latestSnapshotInYear(Number(currentMonthKey().slice(0, 4)) - 1) || oldestSnapshot();
  if (!snapshot) {
    return {
      empty: true,
      assetDiff: 0,
      dividendDiff: 0,
      sideProfitDiff: 0,
      fireAgeDiffText: "記録待ち",
      fireAgeDiffValue: null
    };
  }

  return {
    empty: false,
    assetDiff: totalAssets() - snapshot.total,
    dividendDiff: diffFromSnapshot(snapshot, "dividends", state.assets.dividends),
    sideProfitDiff: diffFromSnapshot(snapshot, "sideProfit", monthlySideProfit()),
    fireAgeDiffText: snapshot.fireAge ? formatFireAgeDiff(arrivalAge() - snapshot.fireAge) : "記録待ち",
    fireAgeDiffValue: snapshot.fireAge ? -(arrivalAge() - snapshot.fireAge) : null
  };
}

function yearlyShorteningDays() {
  const comparison = yearlyComparison();
  if (typeof comparison.fireAgeDiffValue === "number" && comparison.fireAgeDiffValue > 0) {
    return Math.round(comparison.fireAgeDiffValue * 365);
  }
  return daysShortenedByAmount(Math.max(0, comparison.assetDiff));
}

function victoryMetricValue(metric) {
  const assetDiff = state.lastMonthlyChange?.diff || diffFromSnapshot(findSnapshot(previousMonthKey(currentMonthKey())), "total", totalAssets());
  const savings = outcomeTotals(outcomeEntriesFor("month")).saving;
  if (metric === "profit") return monthlySideProfit();
  if (metric === "saving") return savings;
  if (metric === "assetGrowth") return assetDiff;
  return 0;
}

function monthlyVictoryConditions() {
  return state.victoryGoals.map((goal) => ({
    ...goal,
    current: victoryMetricValue(goal.metric),
    unit: "money"
  }));
}

function renderVictoryConditions() {
  const conditions = monthlyVictoryConditions();
  const achieved = conditions.filter((item) => item.current >= item.target).length;
  setText("victoryRate", conditions.length ? `${Math.round((achieved / conditions.length) * 100)}%` : "未設定");
  document.getElementById("victoryList").innerHTML = conditions.length ? conditions
    .map((item) => {
      const done = item.current >= item.target;
      const current = item.unit === "count" ? `${numberFormatter.format(item.current)}回` : yen.format(item.current);
      const target = item.unit === "count" ? `${numberFormatter.format(item.target)}回` : yen.format(item.target);
      return `
        <div class="victory-row ${done ? "is-done" : ""}">
          <span>${done ? "OK" : ""}</span>
          <strong>${item.label}</strong>
          <b>${current} / ${target}</b>
        </div>
      `;
    })
    .join("") : '<p class="outcome-empty">設定で条件を追加できます</p>';
}

function diffFromSnapshot(snapshot, key, currentValue) {
  if (!snapshot || typeof snapshot[key] !== "number") return 0;
  return currentValue - snapshot[key];
}

function findSnapshot(month) {
  return normalizeAssetHistory(state.assetHistory || []).find((item) => item.month === month);
}

function oldestSnapshot() {
  return normalizeAssetHistory(state.assetHistory || [])[0];
}

function latestSnapshotInYear(year) {
  const snapshots = normalizeAssetHistory(state.assetHistory || [])
    .filter((item) => item.month.startsWith(`${year}-`));
  return snapshots[snapshots.length - 1];
}

function yearAgoMonthKey() {
  const [year, month] = currentMonthKey().split("-").map(Number);
  return `${year - 1}-${String(month).padStart(2, "0")}`;
}

function formatFireAgeDiff(diff) {
  if (!diff) return "変化なし";
  if (diff < 0) return `${formatYears(Math.abs(diff))}短縮`;
  return `${formatYears(diff)}後退`;
}

function formatFireDaysDiff(value) {
  if (typeof value !== "number" || value === 0) return "変化なし";
  const days = Math.round(Math.abs(value) * 365);
  return value > 0 ? `${numberFormatter.format(days)}日短縮` : `${numberFormatter.format(days)}日後退`;
}

function heroJournal() {
  const monthLabel = `${Number(currentMonthKey().split("-")[1])}月`;
  const assetDiff = state.lastMonthlyChange?.diff || diffFromSnapshot(findSnapshot(previousMonthKey(currentMonthKey())), "total", totalAssets());
  const dividendDiff = diffFromSnapshot(findSnapshot(previousMonthKey(currentMonthKey())), "dividends", state.assets.dividends);
  const shortened = monthlyShorteningDays();

  return {
    title: `${monthLabel}の振り返り`,
    body: `資産 ${formatDiff(assetDiff)}、配当 ${formatDiff(dividendDiff)}。FIREまで${formatShortening(shortened)}短縮。着実に過去の自分を上回る1か月です。`
  };
}

function renderAssets() {
  const values = [
    ["投資", "investments", state.assets.investments],
    ["現金", "cash", state.assets.cash],
    ["配当", "dividends", state.assets.dividends]
  ];
  const sum = values.reduce((total, item) => total + item[2], 0) || 1;
  let angle = 0;
  const stops = values
    .map(([, key, value]) => {
      const start = angle;
      angle += (value / sum) * 360;
      return `${colors[key]} ${start}deg ${angle}deg`;
    })
    .join(", ");

  document.getElementById("assetDonut").style.background = `conic-gradient(${stops})`;
  document.getElementById("assetLegend").innerHTML = values
    .map(([label, key, value]) => `
      <div class="legend-item">
        <div class="legend-left">
          <span class="swatch" style="background:${colors[key]}"></span>
          <span>${label}</span>
        </div>
        <strong>${yen.format(value)}</strong>
      </div>
    `)
    .join("");
}

function assetTrendItems() {
  const currentMonth = currentMonthKey();
  let history = normalizeAssetHistory(state.assetHistory || []);

  if (!history.length && state.lastMonthlyChange?.previousTotal) {
    history = [
      snapshotForMonth(previousMonthKey(currentMonth), state.lastMonthlyChange.previousTotal),
      snapshotForMonth(currentMonth, totalAssets())
    ];
  }

  if (!history.some((item) => item.month === currentMonth)) {
    history.push(snapshotForMonth(currentMonth, totalAssets()));
  }

  return normalizeAssetHistory(history).slice(-6);
}

function renderAssetTrend() {
  const chart = document.getElementById("assetBarChart");
  const note = document.getElementById("assetTrendNote");
  const items = assetTrendItems();
  const maxTotal = Math.max(...items.map((item) => item.total), 1);
  const first = items[0]?.total || 0;
  const last = items[items.length - 1]?.total || 0;
  const diff = last - first;

  setText("assetTrendDelta", items.length >= 2 ? formatDiff(diff) : "記録開始");
  setSignedClass("assetTrendDelta", diff);
  note.textContent = items.length >= 2 ? "直近の月次更新から自動で表示" : "月次更新で推移が育ちます";
  chart.innerHTML = items
    .map((item) => {
      const height = Math.max(8, Math.round((item.total / maxTotal) * 100));
      return `
        <div class="bar-item">
          <div class="bar-value">${formatCompactYen(item.total)}</div>
          <div class="bar-track">
            <span style="height:${height}%"></span>
          </div>
          <strong>${formatMonthLabel(item.month)}</strong>
        </div>
      `;
    })
    .join("");
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-");
  return `${year}/${String(Number(month)).padStart(2, "0")}`;
}

function renderHistory() {
  const history = document.getElementById("progressHistory");
  const entries = state.progressEntries.slice(0, 5);
  if (!entries.length) {
    history.innerHTML = `<div class="empty-history">まだ前進ログはありません</div>`;
    return;
  }

  history.innerHTML = entries
    .map((entry) => `
      <div class="history-item">
        <div class="history-main">
          <strong>${escapeHtml(entry.text)}</strong>
          <span class="history-date">${formatEntryDate(entry.date)}</span>
        </div>
        <button class="delete-progress" type="button" data-delete-progress="${escapeHtml(entry.id)}" aria-label="${escapeHtml(entry.text)}を削除">削除</button>
      </div>
    `)
    .join("");
}

function formatEntryDate(dateText) {
  const [, month, day] = dateText.split("-");
  return `${Number(month)}/${Number(day)}`;
}

function hydrateSettings() {
  const form = document.getElementById("settingsForm");
  const profileForm = document.getElementById("profileForm");
  profileForm.elements.birthDate.value = state.profile.birthDate || "";
  profileForm.elements.targetAge.value = String(Number(state.profile.targetAge) || 45);
  profileForm.elements.heroTitle.value = heroTitleOptions.includes(state.profile.heroTitle) ? state.profile.heroTitle : defaultState.profile.heroTitle;
  profileForm.elements.monthlyExpense.value = formatInputNumber(state.profile.monthlyExpense);
  profileForm.elements.dailyCost.value = formatInputNumber(dailyCostAmount());
  profileForm.elements.householdType.value = state.profile.householdType === "single" ? "single" : "twoPlus";
  profileForm.elements.birthDate.max = todayKey();
  form.elements.investments.value = formatInputNumber(state.assets.investments);
  form.elements.cash.value = formatInputNumber(state.assets.cash);
  form.elements.dividends.value = formatInputNumber(state.assets.dividends);
  form.elements.fireGoal.value = formatInputNumber(state.profile.fireGoal);
  form.elements.monthlyInvestmentAmount.value = formatInputNumber(state.profile.monthlyInvestmentAmount);
  form.elements.investmentGrowthRate.value = String(Number(state.profile.investmentGrowthRate) || 0);
  form.elements.growthRateMode.value = state.profile.growthRateMode === "holdings" ? "holdings" : "manual";
  form.elements.returnScenario.value = Object.hasOwn(returnScenarioLabels, state.profile.returnScenario) ? state.profile.returnScenario : "standard";
  form.elements.yearlyAssetGrowth.value = formatInputNumber(state.profile.yearlyAssetGrowth);
}

function hydrateDateInputs() {
  const outcomeDate = document.getElementById("outcomeForm").elements.date;
  outcomeDate.max = todayKey();
  if (!outcomeDate.value) outcomeDate.value = todayKey();
}

function formatInputNumber(value) {
  return numberFormatter.format(Number(value || 0));
}

function formatNumericInputValue(value) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  if (!digits) return "";
  return numberFormatter.format(Number(digits));
}

function formatDecimalInput(value) {
  const numeric = Number(value) || 0;
  if (!numeric) return "";
  const text = String(numeric);
  return text.includes(".") ? text.replace(/0+$/, "").replace(/\.$/, "") : text;
}

function formatDecimalInputValue(value) {
  const text = String(value || "").replace(/[^\d.]/g, "");
  const [integer, ...decimalParts] = text.split(".");
  const decimal = decimalParts.join("").slice(0, 8);
  return decimalParts.length ? `${integer || "0"}.${decimal}` : integer;
}

function formatSignedNumericInputValue(value) {
  const text = String(value || "");
  const sign = text.trim().startsWith("-") ? "-" : "";
  const digits = text.replace(/[^\d]/g, "");
  if (!digits) return sign;
  return `${sign}${numberFormatter.format(Number(digits))}`;
}

function parseInputNumber(value) {
  return Number(String(value || "").replace(/[^\d]/g, "")) || 0;
}

function parseDecimalInputNumber(value) {
  return Number(String(value || "").replace(/[^\d.]/g, "")) || 0;
}

function parseSignedInputNumber(value) {
  const text = String(value || "").trim();
  const sign = text.startsWith("-") ? -1 : 1;
  const amount = parseInputNumber(text);
  return sign * amount;
}

function formatDiff(value) {
  if (typeof value !== "number") return "--";
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${yen.format(Math.abs(value))}`;
}

function formatUpdatedAt(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function showSaveStatus(message = "保存しました") {
  const status = document.getElementById("saveStatus");
  status.textContent = message;
  window.clearTimeout(saveStatusTimer);
  saveStatusTimer = window.setTimeout(() => {
    status.textContent = "";
  }, 2200);
}

function showDailyStatus(message) {
  const status = document.getElementById("dailyStatus");
  if (!status) return;
  status.textContent = message;
  window.clearTimeout(dailyStatusTimer);
  dailyStatusTimer = window.setTimeout(() => {
    status.textContent = "";
  }, 2200);
}

function showBackupStatus(message) {
  const status = document.getElementById("backupStatus");
  status.textContent = message;
  window.clearTimeout(backupStatusTimer);
  backupStatusTimer = window.setTimeout(() => {
    status.textContent = "";
  }, 2600);
}

function showProfileStatus(message) {
  const status = document.getElementById("profileStatus");
  status.textContent = message;
  window.clearTimeout(profileStatusTimer);
  profileStatusTimer = window.setTimeout(() => {
    status.textContent = "";
  }, 2400);
}

function showCustomizationStatus(message) {
  const status = document.getElementById("customizationStatus");
  status.textContent = message;
  window.clearTimeout(customizationStatusTimer);
  customizationStatusTimer = window.setTimeout(() => {
    status.textContent = "";
  }, 2400);
}

function showOutcomeStatus(message) {
  const status = document.getElementById("outcomeStatus");
  status.textContent = message;
  window.clearTimeout(outcomeStatusTimer);
  outcomeStatusTimer = window.setTimeout(() => {
    status.textContent = "";
  }, 2400);
}

function hideOutcomeSnack() {
  const snack = document.getElementById("outcomeSnack");
  if (!snack) return;
  snack.hidden = true;
  delete snack.dataset.entryId;
  window.clearTimeout(outcomeSnackTimer);
}

function showOutcomeSnack(entry) {
  const snack = document.getElementById("outcomeSnack");
  const message = document.getElementById("outcomeSnackMessage");
  if (!snack || !message) return;
  snack.dataset.entryId = entry.id;
  message.textContent = `${formatSignedYen(outcomeContribution(entry))} を記録しました`;
  snack.hidden = false;
  window.clearTimeout(outcomeSnackTimer);
  outcomeSnackTimer = window.setTimeout(hideOutcomeSnack, 5200);
}

function showBuybackToast(amount) {
  const toast = document.getElementById("buybackToast");
  const time = document.getElementById("buybackToastTime");
  if (!toast || !time) return;
  const minutes = savedTimeMinutesForAmount(amount);
  time.textContent = formatBuybackTime(minutes, { signed: true });
  toast.hidden = false;
  toast.classList.remove("is-visible");
  void toast.offsetWidth;
  toast.classList.add("is-visible");
  window.clearTimeout(buybackToastTimer);
  buybackToastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
    toast.hidden = true;
  }, 1800);
}

function showHoldingsStatus(message) {
  const status = document.getElementById("holdingsStatus");
  if (!status) return;
  status.textContent = message;
  window.clearTimeout(holdingsStatusTimer);
  holdingsStatusTimer = window.setTimeout(() => {
    status.textContent = "";
  }, 2600);
}

function exportBackup() {
  applySettingsFormValues(document.getElementById("settingsForm"));
  saveState();
  const backup = {
    app: "life-progress-dashboard",
    version: 1,
    exportedAt: new Date().toISOString(),
    state
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `life-progress-backup-${todayKey()}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  showBackupStatus("バックアップを書き出しました");
}

function importBackupFile(file) {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(reader.result);
      const importedState = parsed.state || parsed;
      const progressEntries = migrateProgressEntries(importedState.progressEntries || []);
      state = normalizeState({ ...importedState, progressEntries });
      saveState();
      render();
      switchView("settings");
      showBackupStatus("バックアップを読み込みました");
    } catch {
      showBackupStatus("読み込みに失敗しました");
    }
  });
  reader.readAsText(file);
}

function readInvestmentHoldingRows() {
  const renderedHoldings = [...document.querySelectorAll("[data-holding-row]")]
    .map((row, index) => {
      const symbol = row.querySelector("[data-holding-field='symbol']")?.value || "custom";
      const preset = holdingPresets.find((item) => item.symbol === symbol);
      const value = parseInputNumber(row.querySelector("[data-holding-field='value']")?.value || "");
      const quantity = parseDecimalInputNumber(row.querySelector("[data-holding-field='quantity']")?.value || "");
      return {
        id: row.dataset.holdingRow || `holding-${Date.now()}-${index}`,
        symbol,
        name: preset?.name || "その他",
        category: preset?.category || "custom",
        source: preset?.source || "manual",
        ticker: preset?.ticker || "",
        dividendYield: Number(preset?.dividendYield) || 0,
        expectedReturnRate: Number(preset?.expectedReturnRate ?? state.profile.investmentGrowthRate) || 0,
        quantity,
        price: parseDecimalInputNumber(row.dataset.holdingPrice || ""),
        priceUpdatedAt: row.dataset.holdingPriceUpdatedAt || "",
        value
      };
    })
    .filter((item) => item.name && item.value >= 0);
  const renderedIds = new Set(renderedHoldings.map((item) => item.id));
  const preservedHoldings = state.investmentHoldings.filter((item) => item.id && !renderedIds.has(item.id));
  return [...renderedHoldings, ...preservedHoldings];
}

async function applyCryptoMarketPrices(holdings) {
  const cryptoHoldings = holdings.filter((item) => isCryptoHolding(item) && item.ticker && item.quantity > 0);
  if (!cryptoHoldings.length) return { holdings, updated: false, failed: false };

  const ids = [...new Set(cryptoHoldings.map((item) => item.ticker))];
  try {
    const params = new URLSearchParams({
      ids: ids.join(","),
      vs_currencies: "jpy",
      include_last_updated_at: "true",
      precision: "full"
    });
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?${params.toString()}`, {
      headers: { accept: "application/json" }
    });
    if (!response.ok) throw new Error(`CoinGecko ${response.status}`);
    const prices = await response.json();
    const updatedAt = new Date().toISOString();
    const nextHoldings = holdings.map((item) => {
      if (!isCryptoHolding(item) || !item.ticker || item.quantity <= 0) return item;
      const price = Number(prices?.[item.ticker]?.jpy) || 0;
      if (!price) return item;
      return {
        ...item,
        price,
        priceUpdatedAt: prices?.[item.ticker]?.last_updated_at
          ? new Date(prices[item.ticker].last_updated_at * 1000).toISOString()
          : updatedAt,
        value: Math.round(item.quantity * price)
      };
    });
    return { holdings: nextHoldings, updated: true, failed: false };
  } catch {
    return { holdings, updated: false, failed: true };
  }
}

function syncHoldingRowValues(holdings) {
  holdings.forEach((item) => {
    const row = [...document.querySelectorAll("[data-holding-row]")]
      .find((candidate) => candidate.dataset.holdingRow === item.id);
    if (!row) return;
    row.dataset.holdingPrice = String(item.price || "");
    row.dataset.holdingPriceUpdatedAt = item.priceUpdatedAt || "";
    const valueInput = row.querySelector("[data-holding-field='value']");
    if (valueInput && document.activeElement !== valueInput) {
      valueInput.value = formatInputNumber(item.value);
    }
  });
  updateHoldingDraftTotals();
}

function upsertInvestmentMarketOutcome(amount) {
  const date = todayKey();
  const id = `auto-market-holdings-${date}`;
  state.outcomeEntries = state.outcomeEntries.filter((entry) => entry.id !== id);
  if (!amount) return;
  state.outcomeEntries.push({
    id,
    date,
    type: "market",
    category: "投資評価額",
    sales: 0,
    amount,
    appliedToMonthlyTotals: false
  });
}

async function saveInvestmentHoldings(options = {}) {
  const priceResult = await applyCryptoMarketPrices(readInvestmentHoldingRows());
  const holdings = priceResult.holdings;
  if (!holdings.length) {
    if (!options.silent) showHoldingsStatus("銘柄名と評価額を入力してください");
    return false;
  }
  if (priceResult.updated) syncHoldingRowValues(holdings);

  const previousTotal = totalAssets();
  const previousInvestments = state.assets.investments;
  const baseline = state.investmentValuationBaseline?.date === todayKey()
    ? state.investmentValuationBaseline
    : { date: todayKey(), value: previousInvestments };
  const nextInvestments = holdings.reduce((sum, item) => sum + item.value, 0);
  const marketDiff = nextInvestments - baseline.value;

  state.investmentHoldings = normalizeInvestmentHoldings(holdings, state.assets);
  state.assets.investments = nextInvestments;
  state.assets.dividends = annualDividendsFromHoldings(state.investmentHoldings);
  state.investmentValuationBaseline = baseline;
  upsertInvestmentMarketOutcome(marketDiff);

  const currentTotal = totalAssets();
  state.lastMonthlyChange = {
    previousTotal,
    currentTotal,
    diff: currentTotal - previousTotal,
    updatedAt: new Date().toISOString()
  };
  recordAssetSnapshot(previousTotal, currentTotal);
  state.lastUpdatedAt = new Date().toISOString();
  saveState();
  if (options.silent) {
    const total = totalAssets();
    const rate = fireRate();
    const todayTotals = outcomeTotals(outcomeEntriesFor("today"));
    const todayChange = todayTotals.total;
    const todayConfirmedAmount = confirmedOutcomeAmount(outcomeEntriesFor("today"));
    const todayImpact = todayShorteningDays();
    const microGoal = updateTimeBuybackState();
    const todayBuybackMinutes = totalConfirmedSavedMinutes("today");
    setText("fireRate", `${rate}%`);
    setText("totalBuybackDays", `人生累計 ${formatBuybackTime(state.totalConfirmedSavedTime)}`);
    setText("todayBuybackTime", formatBuybackTime(todayBuybackMinutes, { signed: true }));
    setText("microGoalLevel", `Lv.${microGoal.level}`);
    setText("microGoalTitle", `${microGoal.title}（${yen.format(microGoal.targetAmount)}）`);
    setText("microGoalProgressLabel", `${microGoal.progressRate}%`);
    setText("microGoalRemaining", `あと${yen.format(microGoal.remainingAmount)}で${microGoal.level}日分`);
    setText("buybackBasis", `1日 ${yen.format(dailyCostAmount())} = 8時間`);
    const microGoalProgress = document.getElementById("microGoalProgress");
    if (microGoalProgress) microGoalProgress.style.width = `${microGoal.progressRate}%`;
    setText("totalAssets", yen.format(total));
    setText("heroTotalAssets", yen.format(total));
    setText("annualDividendResult", yen.format(state.assets.dividends));
    setText("annualDividendPower", `${yen.format(state.assets.dividends)}/年`);
    setText("effectiveGrowthRate", `${effectiveInvestmentGrowthRate()}%`);
    setText("effectiveFireGoal", yen.format(fireGoalAmount()));
    setText("growthRateNote", growthRateNoteText());
    setSignedText("heroTodayAssetChange", todayChange);
    setSignedText("heroTodayAssetRate", todayChange, `(${formatPrecisePercent(todayAssetChangeRate())})`);
    setSignedText("todayMarketChange", todayTotals.market);
    setSignedText("todayProfitChange", todayTotals.profit);
    setSignedText("todaySavingChange", todayTotals.saving);
    setSignedText("todayDividendChange", todayTotals.dividend);
    setSignedText("todaySpendingChange", -todayTotals.spending);
    setSignedText("todayShortening", todayImpact, formatSignedImpact(todayImpact));
    renderShorteningBasis(todayConfirmedAmount, todayImpact);
    renderDailyStreak();
    renderDailyMomentum();
    document.getElementById("fireProgress").style.width = `${rate}%`;
    setText("fireProgressLabel", `${rate}%`);
    const yearsToFire = yearsToFireDecimal();
    setText("resultYearsToFire", typeof yearsToFire === "number" ? `約${yearsToFire.toFixed(1)}年` : "積立額を入力");
    setText("resultFireAge", formatAge(arrivalAge()));
    renderResultHighlights();
    renderFireProjection();
    renderAssets();
    renderAssetTrend();
    hydrateSettings();
  } else {
    render();
  }
  const statusMessage = priceResult.failed
    ? "暗号資産価格を取得できませんでした。手入力の評価額で更新しました"
    : options.statusMessage || (options.silent ? `自動反映済み。今日の市場 ${formatSignedYen(marketDiff)}` : `投資評価額を反映しました。今日の市場 ${formatSignedYen(marketDiff)}`);
  showHoldingsStatus(statusMessage);
  return true;
}

function showRefreshAllDone() {
  const button = document.getElementById("refreshAll");
  if (!button) return;
  const label = button.querySelector("span");
  const originalText = label?.textContent || "";
  if (label) label.textContent = "完了";
  button.disabled = false;
  button.classList.remove("is-refreshing");
  button.classList.add("is-done");
  button.setAttribute("aria-label", "更新完了");
  window.clearTimeout(refreshAllTimer);
  refreshAllTimer = window.setTimeout(() => {
    if (label) label.textContent = originalText || "更新";
    button.classList.remove("is-done");
    button.setAttribute("aria-label", "全体を更新");
  }, 1400);
}

function showRefreshAllLoading() {
  const button = document.getElementById("refreshAll");
  if (!button) return;
  const label = button.querySelector("span");
  if (label) label.textContent = "更新中";
  button.disabled = true;
  button.classList.remove("is-done");
  button.classList.add("is-refreshing");
  button.setAttribute("aria-label", "更新中");
  window.clearTimeout(refreshAllTimer);
}

function resetRefreshAllButton() {
  const button = document.getElementById("refreshAll");
  if (!button) return;
  const label = button.querySelector("span");
  if (label) label.textContent = "更新";
  button.disabled = false;
  button.classList.remove("is-refreshing", "is-done");
  button.setAttribute("aria-label", "全体を更新");
}

function refreshCryptoPricesOnOpen() {
  const hasCryptoQuantity = state.investmentHoldings.some((item) => isCryptoHolding(item) && item.quantity > 0);
  if (!hasCryptoQuantity) return;
  window.setTimeout(() => {
    saveInvestmentHoldings({ silent: true });
  }, 500);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

const progressForm = document.getElementById("progressForm");
if (progressForm) {
  progressForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("progressInput");
    const text = input.value.trim();
    if (!addProgress(text, selectedProgressDate())) return;
    input.value = "";
  });
}

const progressDateInput = document.getElementById("progressDate");
if (progressDateInput) {
  progressDateInput.addEventListener("change", () => {
    renderTodayQuests();
    const entries = progressEntriesForDate(selectedProgressDate());
    setText("todayLimit", `${entries.length} / ${dailyEntryLimit}`);
    document.getElementById("progressInput").disabled = entries.length >= dailyEntryLimit;
    document.querySelector("#progressForm button").disabled = entries.length >= dailyEntryLimit;
  });
}

document.querySelectorAll("[data-view-target]").forEach((button) => {
  button.addEventListener("click", () => {
    switchView(button.dataset.viewTarget);
  });
});

const appShell = document.querySelector(".app-shell");
if (appShell) {
  appShell.addEventListener("touchstart", handleViewSwipeStart, { passive: true });
  appShell.addEventListener("touchend", handleViewSwipeEnd, { passive: true });
  appShell.addEventListener("touchcancel", resetViewSwipe, { passive: true });
}

document.getElementById("outcomeForm").elements.type.addEventListener("change", (event) => {
  event.currentTarget.form.elements.category.value = "";
  renderOutcomeFormOptions();
});

document.getElementById("outcomeForm").addEventListener("input", (event) => {
  if (event.target.matches("[data-signed-number-input]")) {
    event.target.value = formatSignedNumericInputValue(event.target.value);
    return;
  }
  if (!event.target.matches("[data-number-input]")) return;
  event.target.value = formatNumericInputValue(event.target.value);
});

document.getElementById("outcomeForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const type = Object.hasOwn(outcomeCategories, form.elements.type.value) ? form.elements.type.value : "profit";
  const amount = parseSignedInputNumber(form.elements.amount.value);
  if ((type === "market" && amount === 0) || (type !== "market" && amount <= 0)) {
    showOutcomeStatus("金額を入力してください");
    return;
  }

  const category = form.elements.category.value.trim();
  const date = form.elements.date.value || todayKey();
  if (!category) {
    showOutcomeStatus("内容を入力してください");
    return;
  }
  const entry = {
    id: `outcome-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date,
    type,
    category,
    sales: 0,
    amount,
    appliedToMonthlyTotals: false
  };
  state.outcomeEntries.push(entry);

  saveState();
  form.reset();
  render();
  const contribution = outcomeContribution(entry);
  showOutcomeStatus(`${formatSignedYen(contribution)}で${formatBuybackTime(savedTimeMinutesForAmount(contribution), { signed: true })}買い戻しました`);
  if (contribution > 0) {
    const savedMinutes = savedTimeMinutesForAmount(contribution);
    showBuybackToast(contribution);
    showFireCountdownImpact(savedMinutes);
    updateFireCountdown();
  }
});

const outcomeQuickActions = document.getElementById("outcomeQuickActions");
if (outcomeQuickActions) {
  outcomeQuickActions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-outcome-quick-id]");
    if (!button) return;
    const action = state.outcomeQuickActions.find((item) => item.id === button.dataset.outcomeQuickId);
    if (!action) return;
    const entry = {
      id: `outcome-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: todayKey(),
      type: action.type,
      category: action.category,
      sales: 0,
      amount: action.amount,
      appliedToMonthlyTotals: false
    };
    state.outcomeEntries.push(entry);
    saveState();
    render();
    showOutcomeSnack(entry);
    const contribution = outcomeContribution(entry);
    const savedMinutes = savedTimeMinutesForAmount(contribution);
    showBuybackToast(contribution);
    showFireCountdownImpact(savedMinutes);
    updateFireCountdown();
    setText("dailyMomentumMessage", `${formatSignedYen(action.amount)}で${formatBuybackTime(savedTimeMinutesForAmount(outcomeContribution(entry)), { signed: true })}買い戻しました`);
  });
}

const outcomeSnack = document.getElementById("outcomeSnack");
if (outcomeSnack) {
  outcomeSnack.addEventListener("click", (event) => {
    const button = event.target.closest("[data-snack-action]");
    if (!button) return;
    const entryId = outcomeSnack.dataset.entryId;
    const entry = state.outcomeEntries.find((item) => item.id === entryId);
    if (!entry) {
      hideOutcomeSnack();
      return;
    }

    if (button.dataset.snackAction === "undo") {
      state.outcomeEntries = state.outcomeEntries.filter((item) => item.id !== entryId);
      saveState();
      render();
      hideOutcomeSnack();
      return;
    }

    if (button.dataset.snackAction === "edit") {
      const value = window.prompt("金額を修正", String(entry.amount));
      if (value === null) return;
      const amount = parseInputNumber(value);
      if (amount <= 0) return;
      entry.amount = amount;
      saveState();
      render();
      showOutcomeSnack(entry);
      showBuybackToast(outcomeContribution(entry));
    }
  });
}

document.getElementById("investmentHoldingsForm").addEventListener("input", (event) => {
  if (event.target.id === "holdingSearchInput") {
    holdingSearchQuery = event.target.value;
    localStorage.setItem("life-progress-holding-search", holdingSearchQuery);
    renderInvestmentHoldings();
    return;
  }
  if (event.target.matches("[data-decimal-input]")) {
    event.target.value = formatDecimalInputValue(event.target.value);
  }
  if (event.target.matches("[data-number-input]")) {
    event.target.value = formatNumericInputValue(event.target.value);
  }
  updateHoldingDraftTotals();
  scheduleInvestmentHoldingsAutoSave();
});

document.getElementById("investmentHoldingsForm").addEventListener("change", (event) => {
  if (event.target.id === "holdingCategoryFilter") {
    holdingFilterType = event.target.value;
    localStorage.setItem("life-progress-holding-filter-type", holdingFilterType);
    holdingSearchQuery = "";
    localStorage.setItem("life-progress-holding-search", holdingSearchQuery);
    renderInvestmentHoldings();
    return;
  }
  if (!event.target.matches("[data-holding-field='symbol']")) return;
  const row = event.target.closest("[data-holding-row]");
  const preset = holdingPresets.find((item) => item.symbol === event.target.value);
  if (row && preset) {
    state.investmentHoldings = normalizeInvestmentHoldings(readInvestmentHoldingRows(), state.assets);
    renderInvestmentHoldings();
  }
  updateHoldingDraftTotals();
  scheduleInvestmentHoldingsAutoSave();
});

document.getElementById("investmentHoldingsForm").addEventListener("submit", (event) => {
  event.preventDefault();
  saveInvestmentHoldings();
});

function addHoldingFromPreset(preset = filteredHoldingPresets()[0] || holdingPresets[0]) {
  const id = `holding-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  activeHoldingId = id;
  state.investmentHoldings.unshift({
    id,
    symbol: preset.symbol,
    name: preset.name,
    category: preset.category,
    source: preset.source,
    ticker: preset.ticker,
    dividendYield: Number(preset.dividendYield) || 0,
    expectedReturnRate: Number(preset.expectedReturnRate ?? state.profile.investmentGrowthRate) || 0,
    quantity: 0,
    price: 0,
    priceUpdatedAt: "",
    value: 0
  });
  renderInvestmentHoldings();
  document.getElementById("holdingsDetails").open = true;
  const row = [...document.querySelectorAll("[data-holding-row]")]
    .find((candidate) => candidate.dataset.holdingRow === id);
  row?.querySelector(isCryptoHolding(preset) ? "[data-holding-field='quantity']" : "[data-holding-field='value']")
    ?.focus();
}

document.getElementById("addHoldingRow").addEventListener("click", () => {
  addHoldingFromPreset();
});

document.getElementById("refreshAll").addEventListener("click", async () => {
  showRefreshAllLoading();
  try {
    const updated = await saveInvestmentHoldings({ statusMessage: "全体を更新しました" });
    if (updated) {
      showRefreshAllDone();
    } else {
      resetRefreshAllButton();
    }
  } catch (error) {
    resetRefreshAllButton();
    throw error;
  }
});

document.getElementById("holdingSearchResults").addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-holding-preset]");
  if (!button) return;
  const preset = holdingPresets.find((item) => item.symbol === button.dataset.addHoldingPreset);
  if (!preset) return;
  addHoldingFromPreset(preset);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-progress]");
  if (!button) return;
  if (!confirmDelete("この前進記録を削除しますか？")) return;
  deleteProgress(button.dataset.deleteProgress);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-holding]");
  if (!button) return;
  const name = button.getAttribute("aria-label")?.replace("を削除", "") || "この銘柄";
  if (!confirmDelete(`${name}を削除しますか？`)) return;
  const rows = readInvestmentHoldingRows();
  state.investmentHoldings = rows.filter((item) => item.id !== button.dataset.deleteHolding);
  if (activeHoldingId === button.dataset.deleteHolding) activeHoldingId = null;
  if (!state.investmentHoldings.length) {
    state.investmentHoldings = [{ id: `holding-${Date.now()}`, symbol: "custom", name: "投資合計", value: state.assets.investments }];
  }
  renderInvestmentHoldings();
  scheduleInvestmentHoldingsAutoSave();
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-outcome]");
  if (!button) return;
  if (!confirmDelete("この成果記録を削除しますか？")) return;
  deleteOutcome(button.dataset.deleteOutcome);
});

document.getElementById("settingsForm").addEventListener("input", (event) => {
  if (!event.target.matches("[data-number-input]")) return;
  event.target.value = formatNumericInputValue(event.target.value);
});

document.getElementById("settingsForm").elements.investmentGrowthRate.addEventListener("change", (event) => {
  state.profile.investmentGrowthRate = Number(event.target.value) || 0;
  forceFireCountdownReplan = true;
  saveState();
  renderFireProjection();
  showSaveStatus(`利回り${state.profile.investmentGrowthRate}%で再計算しました`);
});

document.getElementById("settingsForm").elements.growthRateMode.addEventListener("change", (event) => {
  state.profile.growthRateMode = event.target.value === "holdings" ? "holdings" : "manual";
  forceFireCountdownReplan = true;
  saveState();
  render();
  const modeLabel = state.profile.growthRateMode === "holdings" ? "保有銘柄の想定リターン" : "想定利回り";
  showSaveStatus(`${modeLabel}でFIRE年数を再計算しました`);
});

document.getElementById("settingsForm").elements.returnScenario.addEventListener("change", (event) => {
  state.profile.returnScenario = Object.hasOwn(returnScenarioLabels, event.target.value) ? event.target.value : "standard";
  forceFireCountdownReplan = true;
  saveState();
  render();
  showSaveStatus(`${returnScenarioLabels[state.profile.returnScenario]}前提でFIRE年数を再計算しました`);
});

document.getElementById("exportBackup").addEventListener("click", exportBackup);

document.getElementById("importBackup").addEventListener("click", () => {
  document.getElementById("backupFile").click();
});

document.getElementById("backupFile").addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (!file) return;
  importBackupFile(file);
  event.target.value = "";
});

const backToTopButton = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  backToTopButton.classList.toggle("is-visible", window.scrollY > 320);
}, { passive: true });
backToTopButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("profileForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  state.profile.birthDate = form.elements.birthDate.value;
  state.profile.targetAge = Math.max(1, Number(form.elements.targetAge.value) || 45);
  state.profile.heroTitle = heroTitleOptions.includes(form.elements.heroTitle.value) ? form.elements.heroTitle.value : defaultState.profile.heroTitle;
  state.profile.monthlyExpense = parseInputNumber(form.elements.monthlyExpense.value);
  state.profile.dailyCost = Math.max(1, parseInputNumber(form.elements.dailyCost.value));
  state.profile.householdType = form.elements.householdType.value === "single" ? "single" : "twoPlus";
  state.profile.currentAge = currentAgeYears();
  forceFireCountdownReplan = true;
  saveState();
  render();
  showProfileStatus("プロフィールと資産比較条件を保存しました");
});

document.getElementById("profileForm").addEventListener("input", (event) => {
  if (!event.target.matches("[data-number-input]")) return;
  event.target.value = formatNumericInputValue(event.target.value);
});

function addProgress(text, date = todayKey()) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const entryDate = date > todayKey() ? todayKey() : date;
  if (progressEntriesForDate(entryDate).length >= dailyEntryLimit) {
    showDailyStatus(`${formatEntryDate(entryDate)}は${dailyEntryLimit}件まで記録済み`);
    return false;
  }

  state.progressEntries.unshift({ text: trimmed, date: entryDate, id: createProgressId({ text: trimmed, date: entryDate }, Date.now()) });
  saveState();
  render();
  showDailyStatus("前進を記録しました");
  return true;
}

const quickActions = document.getElementById("quickActions");
if (quickActions) {
  quickActions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-quick-action-id]");
    if (!button) return;
    const item = state.quickActions.find((action) => action.id === button.dataset.quickActionId);
    if (!item) return;
    addProgress(item.text, selectedProgressDate());
  });
}

const quickActionSettingsList = document.getElementById("quickActionSettingsList");
if (quickActionSettingsList) {
  quickActionSettingsList.addEventListener("change", (event) => {
    const row = event.target.closest("[data-quick-setting]");
    if (!row || !event.target.matches("[data-quick-field]")) return;
    const item = state.quickActions.find((action) => action.id === row.dataset.quickSetting);
    if (!item) return;
    const field = event.target.dataset.quickField;
    const value = event.target.value.trim();
    if (!value) {
      render();
      showCustomizationStatus("表示名と記録内容は空欄にできません");
      return;
    }
    item[field] = value;
    state.quickActions = normalizeQuickActions(state.quickActions);
    saveState();
    render();
    showCustomizationStatus("ワンタップ前進を更新しました");
  });
}

document.getElementById("dividendGoalSettingsList").addEventListener("input", (event) => {
  if (!event.target.matches("[data-number-input]")) return;
  event.target.value = formatNumericInputValue(event.target.value);
});

document.getElementById("dividendGoalSettingsList").addEventListener("change", (event) => {
  const row = event.target.closest("[data-reward-setting]");
  if (!row || !event.target.matches("[data-reward-field]")) return;
  const item = state.dividendGoals.find((goal) => goal.id === row.dataset.rewardSetting);
  if (!item) return;
  const field = event.target.dataset.rewardField;
  const value = event.target.value.trim();
  if ((field === "cost" && parseInputNumber(value) <= 0) || (field === "label" && !value)) {
    render();
    showCustomizationStatus("名称と1円以上の金額を入力してください");
    return;
  }
  item[field] = field === "cost" ? parseInputNumber(value) : value;
  state.dividendGoals = normalizeDividendGoals(state.dividendGoals);
  saveState();
  render();
  showCustomizationStatus("配当目標を更新しました");
});

const quickActionForm = document.getElementById("quickActionForm");
if (quickActionForm) {
  quickActionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.quickActions.length >= 8) {
      showCustomizationStatus("ワンタップ前進は8件までです");
      return;
    }
    const form = event.currentTarget;
    const label = form.elements.label.value.trim();
    const text = form.elements.text.value.trim() || label;
    if (!label || !text) return;
    state.quickActions.push({
      id: `quick-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label,
      text
    });
    state.quickActions = normalizeQuickActions(state.quickActions);
    saveState();
    form.reset();
    render();
    showCustomizationStatus("ワンタップ前進を追加しました");
  });
}

const outcomeQuickSettingsList = document.getElementById("outcomeQuickSettingsList");
if (outcomeQuickSettingsList) {
  outcomeQuickSettingsList.addEventListener("input", (event) => {
    if (!event.target.matches("[data-number-input]")) return;
    event.target.value = formatNumericInputValue(event.target.value);
  });

  outcomeQuickSettingsList.addEventListener("change", (event) => {
    const row = event.target.closest("[data-outcome-quick-setting]");
    if (!row || !event.target.matches("[data-outcome-quick-field]")) return;
    const item = state.outcomeQuickActions.find((action) => action.id === row.dataset.outcomeQuickSetting);
    if (!item) return;
    const field = event.target.dataset.outcomeQuickField;
    const value = event.target.value.trim();
    if ((field === "amount" && parseInputNumber(value) <= 0) || (field !== "amount" && !value)) {
      render();
      showCustomizationStatus("表示名・内容・1円以上の金額を入力してください");
      return;
    }
    item[field] = field === "amount" ? parseInputNumber(value) : value;
    state.outcomeQuickActions = normalizeOutcomeQuickActions(state.outcomeQuickActions);
    saveState();
    render();
    showCustomizationStatus("成果ボタンを更新しました");
  });
}

const outcomeQuickForm = document.getElementById("outcomeQuickForm");
if (outcomeQuickForm) {
  outcomeQuickForm.addEventListener("input", (event) => {
    if (!event.target.matches("[data-number-input]")) return;
    event.target.value = formatNumericInputValue(event.target.value);
  });

  outcomeQuickForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.outcomeQuickActions.length >= 8) {
      showCustomizationStatus("成果ボタンは8件までです");
      return;
    }
    const form = event.currentTarget;
    const label = form.elements.label.value.trim();
    const category = form.elements.category.value.trim();
    const amount = parseInputNumber(form.elements.amount.value);
    const type = form.elements.type.value === "saving" ? "saving" : "profit";
    if (!label || !category || amount <= 0) return;
    state.outcomeQuickActions.push({
      id: `outcome-quick-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      label,
      category,
      amount
    });
    state.outcomeQuickActions = normalizeOutcomeQuickActions(state.outcomeQuickActions);
    saveState();
    form.reset();
    render();
    showCustomizationStatus("成果ボタンを追加しました");
  });
}

document.getElementById("dividendGoalForm").addEventListener("input", (event) => {
  if (!event.target.matches("[data-number-input]")) return;
  event.target.value = formatNumericInputValue(event.target.value);
});

document.getElementById("dividendGoalForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (state.dividendGoals.length >= 8) {
    showCustomizationStatus("配当目標は8件までです");
    return;
  }
  const form = event.currentTarget;
  const label = form.elements.label.value.trim();
  const cost = parseInputNumber(form.elements.cost.value);
  if (!label || cost <= 0) return;
  state.dividendGoals.push({
    id: `reward-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label,
    cost
  });
  state.dividendGoals = normalizeDividendGoals(state.dividendGoals);
  saveState();
  form.reset();
  render();
  showCustomizationStatus("配当目標を追加しました");
});

const victoryGoalSettingsList = document.getElementById("victoryGoalSettingsList");
if (victoryGoalSettingsList) {
  victoryGoalSettingsList.addEventListener("input", (event) => {
    if (!event.target.matches("[data-number-input]")) return;
    event.target.value = formatNumericInputValue(event.target.value);
  });

  victoryGoalSettingsList.addEventListener("change", (event) => {
    const row = event.target.closest("[data-victory-setting]");
    if (!row || !event.target.matches("[data-victory-field]")) return;
    const item = state.victoryGoals.find((goal) => goal.id === row.dataset.victorySetting);
    if (!item) return;
    const field = event.target.dataset.victoryField;
    const value = event.target.value.trim();
    if ((field === "target" && parseInputNumber(value) <= 0) || (field === "label" && !value)) {
      render();
      showCustomizationStatus("名称と1以上の目標値を入力してください");
      return;
    }
    item[field] = field === "target" ? parseInputNumber(value) : value;
    state.victoryGoals = normalizeVictoryGoals(state.victoryGoals);
    saveState();
    render();
    showCustomizationStatus("勝利条件を更新しました");
  });
}

const victoryGoalForm = document.getElementById("victoryGoalForm");
if (victoryGoalForm) {
  victoryGoalForm.addEventListener("input", (event) => {
    if (!event.target.matches("[data-number-input]")) return;
    event.target.value = formatNumericInputValue(event.target.value);
  });

  victoryGoalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (state.victoryGoals.length >= 8) {
      showCustomizationStatus("勝利条件は8件までです");
      return;
    }
    const form = event.currentTarget;
    const label = form.elements.label.value.trim();
    const target = parseInputNumber(form.elements.target.value);
    if (!label || target <= 0) return;
    state.victoryGoals.push({
      id: `victory-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label,
      metric: form.elements.metric.value,
      target
    });
    state.victoryGoals = normalizeVictoryGoals(state.victoryGoals);
    saveState();
    form.reset();
    render();
    showCustomizationStatus("勝利条件を追加しました");
  });
}

document.getElementById("customizationPanel").addEventListener("click", (event) => {
  const outcomeQuickButton = event.target.closest("[data-delete-outcome-quick]");
  if (outcomeQuickButton) {
    if (!confirmDelete("この成果ボタンを削除しますか？")) return;
    state.outcomeQuickActions = state.outcomeQuickActions.filter((item) => item.id !== outcomeQuickButton.dataset.deleteOutcomeQuick);
    saveState();
    render();
    showCustomizationStatus("成果ボタンを削除しました");
    return;
  }

  const quickButton = event.target.closest("[data-delete-quick-action]");
  if (quickButton) {
    if (!confirmDelete("このワンタップ前進を削除しますか？")) return;
    state.quickActions = state.quickActions.filter((item) => item.id !== quickButton.dataset.deleteQuickAction);
    saveState();
    render();
    showCustomizationStatus("ワンタップ前進を削除しました");
    return;
  }

  const rewardButton = event.target.closest("[data-delete-dividend-goal]");
  if (rewardButton) {
    if (!confirmDelete("この配当目標を削除しますか？")) return;
    state.dividendGoals = state.dividendGoals.filter((item) => item.id !== rewardButton.dataset.deleteDividendGoal);
    saveState();
    render();
    showCustomizationStatus("配当目標を削除しました");
    return;
  }

  const victoryButton = event.target.closest("[data-delete-victory-goal]");
  if (!victoryButton) return;
  if (!confirmDelete("この勝利条件を削除しますか？")) return;
  state.victoryGoals = state.victoryGoals.filter((item) => item.id !== victoryButton.dataset.deleteVictoryGoal);
  saveState();
  render();
  showCustomizationStatus("勝利条件を削除しました");
});

function deleteProgress(id) {
  const beforeLength = state.progressEntries.length;
  state.progressEntries = state.progressEntries.filter((entry) => entry.id !== id);
  if (state.progressEntries.length === beforeLength) return;
  saveState();
  render();
  showDailyStatus("前進を削除しました");
}

function deleteOutcome(id) {
  const entry = state.outcomeEntries.find((item) => item.id === id);
  if (!entry) return;

  state.outcomeEntries = state.outcomeEntries.filter((item) => item.id !== id);
  saveState();
  render();
  showOutcomeStatus("成果記録を削除しました");
}

function switchView(viewName) {
  const nextView = !document.getElementById(`view-${viewName}`) ? "overview" : viewName;
  const previousView = currentView;
  const previousIndex = swipeViewOrder.indexOf(previousView);
  const nextIndex = swipeViewOrder.indexOf(nextView);
  const direction = previousIndex !== -1 && nextIndex !== -1 && nextIndex !== previousIndex
    ? nextIndex > previousIndex ? "forward" : "back"
    : "neutral";
  currentView = nextView;
  localStorage.setItem("life-progress-view", nextView);
  document.querySelector(".app-shell")?.setAttribute("data-view-motion", direction);
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("is-active", view.id === `view-${nextView}`);
  });
  document.querySelectorAll("[data-view-target]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.viewTarget === nextView);
  });
}

function resetViewSwipe() {
  swipeState.startX = 0;
  swipeState.startY = 0;
  swipeState.tracking = false;
}

function canStartViewSwipe(target) {
  return !target.closest("button, input, select, textarea, summary, a, label, [contenteditable='true']");
}

function handleViewSwipeStart(event) {
  if (event.touches.length !== 1 || !canStartViewSwipe(event.target)) {
    resetViewSwipe();
    return;
  }
  const touch = event.touches[0];
  swipeState.startX = touch.clientX;
  swipeState.startY = touch.clientY;
  swipeState.tracking = true;
}

function handleViewSwipeEnd(event) {
  if (!swipeState.tracking || currentView === "settings") {
    resetViewSwipe();
    return;
  }
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - swipeState.startX;
  const deltaY = touch.clientY - swipeState.startY;
  resetViewSwipe();
  if (Math.abs(deltaX) < 64 || Math.abs(deltaX) < Math.abs(deltaY) * 1.35) return;
  switchAdjacentSwipeView(deltaX < 0 ? 1 : -1);
}

function switchAdjacentSwipeView(direction) {
  const currentIndex = swipeViewOrder.indexOf(currentView);
  if (currentIndex === -1) return;
  const nextIndex = Math.max(0, Math.min(swipeViewOrder.length - 1, currentIndex + direction));
  if (nextIndex === currentIndex) return;
  switchView(swipeViewOrder[nextIndex]);
}

function recordAssetSnapshot(previousTotal, currentTotal) {
  const month = currentMonthKey();
  let history = normalizeAssetHistory(state.assetHistory || []);

  if (!history.length && previousTotal !== currentTotal) {
    history.push(snapshotForMonth(previousMonthKey(month), previousTotal));
  }

  history = history.filter((item) => item.month !== month);
  history.push(snapshotForMonth(month, currentTotal));
  state.assetHistory = normalizeAssetHistory(history);
}

function snapshotForMonth(month, total) {
  return {
    month,
    total,
    dividends: state.assets.dividends,
    sideProfit: monthlySideProfit(),
    fireAge: arrivalAge()
  };
}

function applySettingsFormValues(form) {
  state.assets.investments = parseInputNumber(form.elements.investments.value);
  state.assets.cash = parseInputNumber(form.elements.cash.value);
  state.assets.dividends = annualDividendsFromHoldings();
  if (state.investmentHoldings.length === 1 && state.investmentHoldings[0].id === "holding-total") {
    state.investmentHoldings[0].value = state.assets.investments;
  }
  state.profile.fireGoal = Math.max(1, parseInputNumber(form.elements.fireGoal.value));
  state.profile.monthlyInvestmentAmount = parseInputNumber(form.elements.monthlyInvestmentAmount.value);
  state.profile.investmentGrowthRate = Number(form.elements.investmentGrowthRate.value) || 0;
  state.profile.growthRateMode = form.elements.growthRateMode.value === "holdings" ? "holdings" : "manual";
  state.profile.returnScenario = Object.hasOwn(returnScenarioLabels, form.elements.returnScenario.value) ? form.elements.returnScenario.value : "standard";
  state.profile.yearlyAssetGrowth = parseInputNumber(form.elements.yearlyAssetGrowth.value);
}

document.getElementById("settingsForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const previousTotal = totalAssets();
  applySettingsFormValues(form);
  forceFireCountdownReplan = true;
  const currentTotal = totalAssets();
  state.lastMonthlyChange = {
    previousTotal,
    currentTotal,
    diff: currentTotal - previousTotal,
    updatedAt: new Date().toISOString()
  };
  recordAssetSnapshot(previousTotal, currentTotal);
  state.lastUpdatedAt = new Date().toISOString();
  saveState();
  render();
  showSaveStatus();
});

window.fireDashboard = {
  getState: () => cloneState(state),
  applyCloudState,
  storageKey
};

render();
refreshCryptoPricesOnOpen();
window.setInterval(updateFireCountdown, 1000);
