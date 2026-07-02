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

const holdingPresets = [
  { symbol: "emaxis-slim-all-country", name: "eMAXIS Slim 全世界株式", category: "fund", source: "apps-script", ticker: "emaxis-slim-all-country", dividendYield: 0, rank: 1, broker: "楽天/SBI" },
  { symbol: "emaxis-slim-sp500", name: "eMAXIS Slim S&P500", category: "fund", source: "apps-script", ticker: "emaxis-slim-sp500", dividendYield: 0, rank: 2, broker: "楽天/SBI" },
  { symbol: "rakuten-plus-sp500", name: "楽天プラス S&P500", category: "fund", source: "apps-script", ticker: "rakuten-plus-sp500", dividendYield: 0, rank: 3, broker: "楽天" },
  { symbol: "rakuten-plus-all-country", name: "楽天プラス オールカントリー", category: "fund", source: "apps-script", ticker: "rakuten-plus-all-country", dividendYield: 0, rank: 4, broker: "楽天" },
  { symbol: "rakuten-schd", name: "楽天SCHD", category: "fund", source: "apps-script", ticker: "rakuten-schd", dividendYield: 3.3, rank: 5, broker: "楽天/SBI" },
  { symbol: "sbi-v-sp500", name: "SBI・V・S&P500", category: "fund", source: "apps-script", ticker: "sbi-v-sp500", dividendYield: 0, rank: 6, broker: "SBI" },
  { symbol: "sbi-v-total-stock-market", name: "SBI・V・全米株式", category: "fund", source: "apps-script", ticker: "sbi-v-total-stock-market", dividendYield: 0, rank: 7, broker: "SBI" },
  { symbol: "ifree-next-fang-plus", name: "iFreeNEXT FANG+インデックス", category: "fund", source: "apps-script", ticker: "ifree-next-fang-plus", dividendYield: 0, rank: 8, broker: "楽天/SBI" },
  { symbol: "nissay-nasdaq100", name: "ニッセイNASDAQ100インデックス", category: "fund", source: "apps-script", ticker: "nissay-nasdaq100", dividendYield: 0, rank: 9, broker: "楽天/SBI" },
  { symbol: "rakuten-vti", name: "楽天・全米株式インデックス", category: "fund", source: "apps-script", ticker: "rakuten-vti", dividendYield: 0, rank: 10, broker: "楽天" },
  { symbol: "emaxis-slim-all-country-ex-japan", name: "eMAXIS Slim 全世界株式 除く日本", category: "fund", source: "apps-script", ticker: "emaxis-slim-all-country-ex-japan", dividendYield: 0, rank: 11, broker: "楽天/SBI" },
  { symbol: "SPYD", name: "SPYD", category: "etf", source: "googlefinance", ticker: "NYSEARCA:SPYD", dividendYield: 4.5, rank: 101, broker: "米国ETF" },
  { symbol: "HDV", name: "HDV", category: "etf", source: "googlefinance", ticker: "NYSEARCA:HDV", dividendYield: 3.5, rank: 102, broker: "米国ETF" },
  { symbol: "VYM", name: "VYM", category: "etf", source: "googlefinance", ticker: "NYSEARCA:VYM", dividendYield: 2.7, rank: 103, broker: "米国ETF" },
  { symbol: "nf-nikkei-high-dividend-50", name: "NF日経高配当50", category: "etf", source: "googlefinance", ticker: "TYO:1489", dividendYield: 3.4, rank: 104, broker: "国内ETF" },
  { symbol: "SPCX", name: "スペースX", category: "stock", source: "googlefinance", ticker: "NASDAQ:SPCX", dividendYield: 0, rank: 201, broker: "米国株" },
  { symbol: "NVDA", name: "エヌビディア", category: "stock", source: "googlefinance", ticker: "NASDAQ:NVDA", dividendYield: 0.03, rank: 202, broker: "米国株" },
  { symbol: "KDDI", name: "KDDI", category: "stock", source: "googlefinance", ticker: "TYO:9433", dividendYield: 3.0, rank: 203, broker: "国内株" },
  { symbol: "BTI", name: "BTI", category: "stock", source: "googlefinance", ticker: "NYSE:BTI", dividendYield: 7.0, rank: 204, broker: "米国株" },
  { symbol: "BTC", name: "ビットコイン", category: "crypto", source: "coingecko", ticker: "bitcoin", dividendYield: 0, rank: 301, broker: "暗号資産", aliases: ["bitcoin"] },
  { symbol: "ETH", name: "イーサリアム", category: "crypto", source: "coingecko", ticker: "ethereum", dividendYield: 0, rank: 302, broker: "暗号資産", aliases: ["ethereum"] },
  { symbol: "XRP", name: "リップル", category: "crypto", source: "coingecko", ticker: "ripple", dividendYield: 0, rank: 303, broker: "暗号資産", aliases: ["ripple"] },
  { symbol: "SOL", name: "ソラナ", category: "crypto", source: "coingecko", ticker: "solana", dividendYield: 0, rank: 304, broker: "暗号資産", aliases: ["solana"] },
  { symbol: "custom", name: "その他", category: "custom", source: "manual", ticker: "", dividendYield: 0, rank: 999, broker: "手入力" }
];

const defaultInvestmentHoldings = [
  { id: "holding-emaxis-sp500", symbol: "emaxis-slim-sp500", name: "eMAXIS Slim S&P500", value: 2791766 },
  { id: "holding-emaxis-all-country", symbol: "emaxis-slim-all-country", name: "eMAXIS Slim 全世界株式", value: 3296970 },
  { id: "holding-rakuten-schd", symbol: "rakuten-schd", name: "楽天SCHD", value: 1526411 },
  { id: "holding-emaxis-all-country-ex-japan", symbol: "emaxis-slim-all-country-ex-japan", name: "eMAXIS Slim 全世界株式 除く日本", value: 1028369 },
  { id: "holding-rakuten-plus-sp500", symbol: "rakuten-plus-sp500", name: "楽天プラス S&P500", value: 101137 },
  { id: "holding-spyd", symbol: "SPYD", name: "SPYD", value: 685334 },
  { id: "holding-hdv", symbol: "HDV", name: "HDV", value: 267228 },
  { id: "holding-vym", symbol: "VYM", name: "VYM", value: 205728 },
  { id: "holding-nf-nikkei-high-dividend-50", symbol: "nf-nikkei-high-dividend-50", name: "NF日経高配当50", value: 187384 },
  { id: "holding-bti", symbol: "BTI", name: "BTI", value: 87886 },
  { id: "holding-kddi", symbol: "KDDI", name: "KDDI", value: 63720 },
  { id: "holding-nvda", symbol: "NVDA", name: "エヌビディア", value: 31796 },
  { id: "holding-spacex", symbol: "SPCX", name: "スペースX", value: 25992 }
];

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
    householdType: "twoPlus",
    investmentGrowthRate: 5,
    yearlyAssetGrowth: 1200000,
    fireGoal: 50000000
  },
  assets: {
    investments: defaultInvestmentTotal,
    cash: 1300000,
    dividends: defaultAnnualDividends
  },
  investmentHoldings: defaultInvestmentHoldings,
  investmentValuationBaseline: null,
  assetHistory: [
    { month: "2024-12", total: 10748696, dividends: null, sideProfit: null, fireAge: null },
    { month: "2025-12", total: 12368409, dividends: null, sideProfit: null, fireAge: null }
  ],
  sideHustles: [
    { name: "商品販売", sales: 0, profit: 0, previousProfit: 0 },
    { name: "コンテンツ販売", sales: 0, profit: 0, previousProfit: 0 },
    { name: "その他副業", sales: 0, profit: 0, previousProfit: 0 }
  ],
  lastUpdatedAt: null,
  lastMonthlyChange: null,
  progressEntries: [],
  outcomeEntries: [],
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
let fireCountdownBaseSeconds = 0;
let fireCountdownStartedAt = Date.now();
let holdingFilterType = localStorage.getItem("life-progress-holding-filter-type") || "fund";
let holdingSearchQuery = localStorage.getItem("life-progress-holding-search") || "";

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
  return {
    ...cloneDefaultState(),
    ...saved,
    profile: { ...defaultState.profile, ...(saved.profile || {}) },
    assets,
    investmentHoldings: normalizedInvestmentHoldings,
    investmentValuationBaseline: normalizeInvestmentValuationBaseline(saved.investmentValuationBaseline),
    assetHistory: ensureBaselineAssetHistory(saved.assetHistory || []),
    sideHustles: normalizeSideHustles(saved.sideHustles),
    progressEntries,
    outcomeEntries: outcomeMigration.entries,
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
  const source = Array.isArray(items) && items.length
    ? items
    : [{ id: "holding-total", symbol: "custom", name: "投資合計", value: Number(savedAssets?.investments) || defaultState.assets.investments }];

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

function normalizeInvestmentValuationBaseline(item) {
  if (!item || typeof item !== "object") return null;
  return {
    date: typeof item.date === "string" ? item.date.slice(0, 10) : todayKey(),
    value: Math.max(0, Math.round(Number(item.value) || 0))
  };
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

function fireRate() {
  return Math.min(100, Math.round((totalAssets() / state.profile.fireGoal) * 100));
}

function remainingToFire() {
  return Math.max(0, state.profile.fireGoal - totalAssets());
}

function nextOnePercentAmount() {
  if (remainingToFire() <= 0) return 0;
  const onePercent = state.profile.fireGoal / 100;
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
  return roundOne(currentAgeDecimal() + yearsToFireDecimal());
}

function daysToFire() {
  return Math.max(0, Math.ceil((remainingToFire() / annualFirePower()) * 365));
}

function exactSecondsToFire() {
  return Math.max(0, Math.round((remainingToFire() / annualFirePower()) * 365 * 24 * 60 * 60));
}

function yearsToFireDecimal() {
  return daysToFire() / 365;
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

function annualFirePower() {
  const monthlyProfit = monthlySideProfit();
  return Math.max(1, state.profile.yearlyAssetGrowth + investmentGrowthAmount() + state.assets.dividends + monthlyProfit * 12);
}

function baseAnnualFirePower() {
  return Math.max(1, state.profile.yearlyAssetGrowth + investmentGrowthAmount() + state.assets.dividends);
}

function fireAgeWithAnnualPower(annualPower) {
  const yearsLeft = remainingToFire() / Math.max(1, annualPower);
  return roundOne(currentAgeDecimal() + yearsLeft);
}

function daysShortenedByAmount(amount) {
  return Math.max(0, Math.round((amount / annualFirePower()) * 365));
}

function exactDaysShortenedByAmount(amount) {
  return Math.max(0, (Math.max(0, Number(amount) || 0) / annualFirePower()) * 365);
}

function signedDaysShortenedByAmount(amount) {
  return ((Number(amount) || 0) / annualFirePower()) * 365;
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

function monthlyShorteningDays() {
  const monthlyProfit = monthlySideProfit();
  const monthlySavings = outcomeTotals(outcomeEntriesFor("month")).saving;
  const diff = state.lastMonthlyChange?.diff || 0;
  return exactDaysShortenedByAmount(Math.max(0, monthlyProfit + monthlySavings + diff));
}

function todayShorteningDays() {
  return signedDaysShortenedByAmount(outcomeTotals(outcomeEntriesFor("today")).total);
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
  return roundOne(averageRetirementAge - arrivalAge());
}

function formatRetirementComparison(value) {
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
  const rounded = roundOne(Number(value) || 0);
  return Number.isInteger(rounded) ? `${rounded}歳` : `${rounded.toFixed(1)}歳`;
}

function formatYears(value) {
  const rounded = roundOne(Number(value) || 0);
  return Number.isInteger(rounded) ? `${rounded}年` : `${rounded.toFixed(1)}年`;
}

function investmentGrowthAmount() {
  return Math.round(state.assets.investments * ((Number(state.profile.investmentGrowthRate) || 0) / 100));
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

function formatFireCountdown(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const days = Math.floor(seconds / 86400);
  const rest = seconds % 86400;
  const hours = Math.floor(rest / 3600);
  const minutes = Math.floor((rest % 3600) / 60);
  const remainingSeconds = rest % 60;
  return `${numberFormatter.format(days)}日\n${padClock(hours)}時間${padClock(minutes)}分${padClock(remainingSeconds)}秒`;
}

function updateFireCountdown() {
  const elapsedSeconds = Math.floor((Date.now() - fireCountdownStartedAt) / 1000);
  setText("fireDistanceHero", formatFireCountdown(fireCountdownBaseSeconds - elapsedSeconds));
}

function renderFireProjection() {
  fireCountdownBaseSeconds = exactSecondsToFire();
  fireCountdownStartedAt = Date.now();
  updateFireCountdown();
  setText("fireYearsHero", `約${yearsToFireDecimal().toFixed(1)}年`);
  setText("arrivalAge", formatAge(arrivalAge()));
  setText("monthlyShortening", formatShortening(monthlyShorteningDays()));
  setText("investmentGrowthAmount", yen.format(investmentGrowthAmount()));
  setText("retirementLead", formatRetirementComparison(retirementLeadYears()));
  setText("currentAgeDisplay", formatAge(currentAgeYears()));
}

function render() {
  const total = totalAssets();
  const rate = fireRate();
  const monthlySavings = outcomeTotals(outcomeEntriesFor("month")).saving;
  const todayTotals = outcomeTotals(outcomeEntriesFor("today"));
  const todayChange = todayTotals.total;
  const yearly = yearlyComparison();

  setText("fireRate", `${rate}%`);
  setText("totalAssets", yen.format(total));
  setText("heroTotalAssets", yen.format(total));
  setSignedText("heroTodayAssetChange", todayChange);
  setSignedText("heroTodayAssetRate", todayChange, `(${formatPrecisePercent(todayAssetChangeRate())})`);
  setSignedText("todayMarketChange", todayTotals.market);
  setSignedText("todayProfitChange", todayTotals.profit);
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
  const todayImpact = todayShorteningDays();
  const shortening = monthlyShorteningDays();
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
  setText("monthlyFireDelta", formatFireDaysDiff(monthlyComparison().fireAgeDiffValue));
  setSignedText("todayShortening", todayImpact, formatSignedImpact(todayImpact));
  setText("yearlyShortening", formatShortening(yearlyShorteningDays()));
  setText("nextOnePercentAmount", nextOnePercentAmount() ? `あと${yen.format(nextOnePercentAmount())}` : "達成済み");
  setSignedClass("monthlyAssetDiff", state.lastMonthlyChange?.diff);
  setSignedClass("monthlyAssetRate", monthlyAssetRateChange());
  setSignedClass("yearlyAssetDiffResult", yearly.assetDiff);
  setSignedClass("peerAverageDiff", peerAverage ? total - peerAverage : null);
  setText("fireProgressLabel", `${rate}%`);
  document.getElementById("fireProgress").style.width = `${rate}%`;
  renderFireProjection();
  hydrateDateInputs();

  renderSideHustles();
  renderDividendPower();
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

  setText("holdingsTotal", yen.format(total));
  setText("holdingsSummary", `${holdings.length}件 / ${yen.format(total)}`);
  renderHoldingSearchResults();
  list.innerHTML = holdings
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
        <label>
          <span>表示名</span>
          <input data-holding-field="name" value="${escapeHtml(item.name)}" maxlength="28" placeholder="例: S&P500" />
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
    .join("");
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
  const quickList = document.getElementById("quickActionSettingsList");
  const rewardList = document.getElementById("dividendGoalSettingsList");
  const victoryList = document.getElementById("victoryGoalSettingsList");

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
  const lifetime = outcomeTotals(outcomeEntriesFor("lifetime"));

  list.innerHTML = `
    ${renderImpactPeriod("今日の成果", today, "today")}
    ${renderImpactPeriod("今月累計", monthEntries, "month")}
    <div class="impact-lifetime">
      <small>人生累計（記録開始から）</small>
      <span>FIRE短縮</span>
      <strong>${formatLifetimeShortening(exactDaysShortenedByAmount(lifetime.total))}</strong>
    </div>
    <p class="impact-note">現在の年間増加見込み・投資成長・配当・副業利益を基準に換算</p>
  `;

}

function renderImpactPeriod(title, totals, period) {
  const days = exactDaysShortenedByAmount(totals.total);
  return `
    <section class="impact-period ${period === "today" ? "is-today" : ""}">
      <h3>${title}</h3>
      <div><span>副業利益</span><strong>+${yen.format(totals.profit)}</strong></div>
      <div><span>節約</span><strong>+${yen.format(totals.saving)}</strong></div>
      <div class="impact-total"><span>利益＋節約</span><strong>+${yen.format(totals.total)}</strong></div>
      <div class="impact-fire"><span>FIRE短縮</span><strong>${formatImpactDays(days)}</strong></div>
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
  container.innerHTML = entries.map((entry) => `
    <div class="outcome-row">
      <div class="outcome-main">
        <strong>${escapeHtml(entry.category)}</strong>
        <small>${formatEntryDate(entry.date)}・${outcomeTypeLabels[entry.type] || "成果"}</small>
      </div>
      <div class="outcome-values">
        <span>${formatSignedYen(outcomeContribution(entry))}</span>
        <b>${formatSignedImpact(signedDaysShortenedByAmount(outcomeContribution(entry)))}自由</b>
      </div>
      <button type="button" data-delete-outcome="${escapeHtml(entry.id)}" aria-label="${escapeHtml(entry.category)}を削除">削除</button>
    </div>
  `).join("");
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
  profileForm.elements.householdType.value = state.profile.householdType === "single" ? "single" : "twoPlus";
  profileForm.elements.birthDate.max = todayKey();
  form.elements.investments.value = formatInputNumber(state.assets.investments);
  form.elements.cash.value = formatInputNumber(state.assets.cash);
  form.elements.dividends.value = formatInputNumber(state.assets.dividends);
  form.elements.fireGoal.value = formatInputNumber(state.profile.fireGoal);
  form.elements.investmentGrowthRate.value = String(Number(state.profile.investmentGrowthRate) || 0);
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
  return [...document.querySelectorAll("[data-holding-row]")]
    .map((row, index) => {
      const symbol = row.querySelector("[data-holding-field='symbol']")?.value || "custom";
      const preset = holdingPresets.find((item) => item.symbol === symbol);
      const name = row.querySelector("[data-holding-field='name']")?.value.trim() || "";
      const value = parseInputNumber(row.querySelector("[data-holding-field='value']")?.value || "");
      const quantity = parseDecimalInputNumber(row.querySelector("[data-holding-field='quantity']")?.value || "");
      return {
        id: row.dataset.holdingRow || `holding-${Date.now()}-${index}`,
        symbol,
        name: name || preset?.name || "その他",
        category: preset?.category || "custom",
        source: preset?.source || "manual",
        ticker: preset?.ticker || "",
        dividendYield: Number(preset?.dividendYield) || 0,
        quantity,
        price: parseDecimalInputNumber(row.dataset.holdingPrice || ""),
        priceUpdatedAt: row.dataset.holdingPriceUpdatedAt || "",
        value
      };
    })
    .filter((item) => item.name && item.value >= 0);
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
    const todayImpact = todayShorteningDays();
    setText("fireRate", `${rate}%`);
    setText("totalAssets", yen.format(total));
    setText("heroTotalAssets", yen.format(total));
    setText("annualDividendResult", yen.format(state.assets.dividends));
    setText("annualDividendPower", `${yen.format(state.assets.dividends)}/年`);
    setSignedText("heroTodayAssetChange", todayChange);
    setSignedText("heroTodayAssetRate", todayChange, `(${formatPrecisePercent(todayAssetChangeRate())})`);
    setSignedText("todayMarketChange", todayTotals.market);
    setSignedText("todayProfitChange", todayTotals.profit);
    setSignedText("todayDividendChange", todayTotals.dividend);
    setSignedText("todaySpendingChange", -todayTotals.spending);
    setSignedText("todayShortening", todayImpact, formatSignedImpact(todayImpact));
    document.getElementById("fireProgress").style.width = `${rate}%`;
    setText("fireProgressLabel", `${rate}%`);
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
  button.classList.add("is-done");
  window.clearTimeout(refreshAllTimer);
  refreshAllTimer = window.setTimeout(() => {
    if (label) label.textContent = originalText || "更新";
    button.classList.remove("is-done");
  }, 1400);
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
  showOutcomeStatus(`${formatSignedYen(contribution)}で自由まで${formatSignedImpact(signedDaysShortenedByAmount(contribution))}`);
});

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
  const nameInput = row?.querySelector("[data-holding-field='name']");
  if (preset && preset.symbol !== "custom" && nameInput) nameInput.value = preset.name;
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
  state.investmentHoldings.push({
    id,
    symbol: preset.symbol,
    name: preset.name,
    category: preset.category,
    dividendYield: Number(preset.dividendYield) || 0,
    value: 0
  });
  renderInvestmentHoldings();
  document.getElementById("holdingsDetails").open = true;
  [...document.querySelectorAll("[data-holding-row]")]
    .find((row) => row.dataset.holdingRow === id)
    ?.querySelector("[data-holding-field='value']")
    ?.focus();
}

document.getElementById("addHoldingRow").addEventListener("click", () => {
  addHoldingFromPreset();
});

document.getElementById("refreshAll").addEventListener("click", async () => {
  const updated = await saveInvestmentHoldings({ statusMessage: "全体を更新しました" });
  if (updated) showRefreshAllDone();
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
  saveState();
  renderFireProjection();
  showSaveStatus(`利回り${state.profile.investmentGrowthRate}%で再計算しました`);
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
  state.profile.householdType = form.elements.householdType.value === "single" ? "single" : "twoPlus";
  state.profile.currentAge = currentAgeYears();
  saveState();
  render();
  showProfileStatus("プロフィールと資産比較条件を保存しました");
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
  currentView = nextView;
  localStorage.setItem("life-progress-view", nextView);
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("is-active", view.id === `view-${nextView}`);
  });
  document.querySelectorAll("[data-view-target]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.viewTarget === nextView);
  });
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
  state.profile.investmentGrowthRate = Number(form.elements.investmentGrowthRate.value) || 0;
  state.profile.yearlyAssetGrowth = parseInputNumber(form.elements.yearlyAssetGrowth.value);
}

document.getElementById("settingsForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const previousTotal = totalAssets();
  applySettingsFormValues(form);
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
