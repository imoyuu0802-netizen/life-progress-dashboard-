const storageKey = "life-progress-dashboard-v1";
const dailyEntryLimit = 5;
const averageRetirementAge = 65;
const outcomeCategories = {
  profit: ["ゲーム販売", "Totebell", "その他副業"],
  saving: ["スタバを我慢", "外食を減らした", "固定費削減", "その他の節約"]
};

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
    investments: 4200000,
    cash: 1300000,
    dividends: 96000
  },
  assetHistory: [
    { month: "2024-12", total: 10748696, dividends: null, sideProfit: null, fireAge: null },
    { month: "2025-12", total: 12368409, dividends: null, sideProfit: null, fireAge: null }
  ],
  sideHustles: [
    { name: "ゲーム販売", sales: 0, profit: 0, previousProfit: 0 },
    { name: "Totebell", sales: 0, profit: 0, previousProfit: 0 },
    { name: "その他副業", sales: 0, profit: 0, previousProfit: 0 }
  ],
  lastUpdatedAt: null,
  lastMonthlyChange: null,
  totalXp: 0,
  progressEntries: [],
  outcomeEntries: [],
  legacyOutcomeMigrationComplete: true
};

let state = loadState();
let currentView = localStorage.getItem("life-progress-view") || "overview";
let saveStatusTimer = null;
let dailyStatusTimer = null;
let backupStatusTimer = null;
let profileStatusTimer = null;
let outcomeStatusTimer = null;

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
  return {
    ...cloneDefaultState(),
    ...saved,
    profile: { ...defaultState.profile, ...(saved.profile || {}) },
    assets: { ...defaultState.assets, ...(saved.assets || {}) },
    assetHistory: ensureBaselineAssetHistory(saved.assetHistory || []),
    sideHustles: normalizeSideHustles(saved.sideHustles),
    totalXp: Number(saved.totalXp) || inferTotalXp(progressEntries),
    progressEntries,
    outcomeEntries: outcomeMigration.entries,
    legacyOutcomeMigrationComplete: outcomeMigration.complete
  };
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
    .filter((entry) => entry && ["profit", "saving"].includes(entry.type) && (Number(entry.amount) > 0 || Number(entry.sales) > 0))
    .map((entry, index) => ({
      id: entry.id || `outcome-${entry.date || "unknown"}-${index}`,
      date: typeof entry.date === "string" ? entry.date.slice(0, 10) : todayKey(),
      type: entry.type,
      category: String(entry.category || (entry.type === "profit" ? "その他副業" : "その他の節約")),
      sales: entry.type === "profit" ? Math.max(0, Number(entry.sales) || 0) : 0,
      amount: Math.max(0, Number(entry.amount) || 0),
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
    id: entry.id || createProgressId(entry, index),
    xp: progressXp(entry)
  }));
}

function createProgressId(entry, index = 0) {
  const text = String(entry.text || "").replace(/[^a-zA-Z0-9ぁ-んァ-ン一-龥]/g, "").slice(0, 18);
  return `progress-${entry.date || "unknown"}-${index}-${text}-${progressXp(entry)}`;
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

function xpForProgress(text) {
  if (text.includes("Totebell")) return 20;
  if (text.includes("AI学習")) return 15;
  if (text.includes("ゲーム出品")) return 10;
  if (text.includes("せどり")) return 10;
  if (text.includes("読書")) return 10;
  if (text.includes("運動")) return 10;
  return 5;
}

function progressXp(entry) {
  return Number(entry.xp) || xpForProgress(entry.text || "");
}

function inferTotalXp(entries) {
  return entries.reduce((sum, entry) => sum + progressXp(entry), 0);
}

function todayXp() {
  return todayEntries().reduce((sum, entry) => sum + progressXp(entry), 0);
}

function levelInfo() {
  const totalXp = Number(state.totalXp) || inferTotalXp(state.progressEntries);
  const level = Math.floor(totalXp / 100) + 1;
  const currentLevelXp = totalXp % 100;
  return {
    totalXp,
    level,
    currentLevelXp,
    nextLevelXp: 100 - currentLevelXp
  };
}

function streakDays() {
  const uniqueDates = [...new Set(state.progressEntries.map((entry) => entry.date))].sort().reverse();
  if (!uniqueDates.length) return 0;

  let streak = 0;
  const cursor = new Date(`${todayKey()}T00:00:00`);
  const dateSet = new Set(uniqueDates);

  while (dateSet.has(formatDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
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
    totals[entry.type] += entry.amount;
    totals.sales += entry.sales;
    totals.total += entry.amount;
    return totals;
  }, { sales: 0, profit: 0, saving: 0, total: 0 });
}

function monthlyShorteningDays() {
  const monthlyProfit = monthlySideProfit();
  const monthlySavings = outcomeTotals(outcomeEntriesFor("month")).saving;
  const diff = state.lastMonthlyChange?.diff || 0;
  return daysShortenedByAmount(Math.max(0, monthlyProfit + monthlySavings + diff));
}

function todayShorteningDays() {
  return exactDaysShortenedByAmount(outcomeTotals(outcomeEntriesFor("today")).total);
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

function renderFireProjection() {
  const fireDays = daysToFire();
  setText("fireDistanceHero", `あと${numberFormatter.format(fireDays)}日（約${yearsToFireDecimal().toFixed(1)}年）`);
  setText("arrivalAge", formatAge(arrivalAge()));
  setText("monthlyShortening", `${monthlyShorteningDays()}日`);
  setText("investmentGrowthAmount", yen.format(investmentGrowthAmount()));
  setText("retirementLead", formatRetirementComparison(retirementLeadYears()));
  setText("currentAgeDisplay", formatAge(currentAgeYears()));
}

function render() {
  const total = totalAssets();
  const rate = fireRate();
  const xp = levelInfo();
  const streak = streakDays();
  const monthlySavings = outcomeTotals(outcomeEntriesFor("month")).saving;
  const yearly = yearlyComparison();

  setText("fireRate", `${rate}%`);
  setText("totalAssets", yen.format(total));
  setText("annualDividendResult", yen.format(state.assets.dividends));
  setText("annualDividendPower", `${yen.format(state.assets.dividends)}/年`);
  setText("monthlySideProfitResult", yen.format(monthlySideProfit()));
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
  const todayCount = todayEntries().length;
  const todayExperience = todayXp();
  const shortening = monthlyShorteningDays();
  setText(
    "fireShortenMessage",
    todayCount > 0
      ? `今日は${todayCount}件前進・+${todayExperience}EXP`
      : shortening > 0
        ? `今月、FIREを${shortening}日短縮`
        : "今日が一番若い日"
  );
  setText("levelLabel", `Lv.${xp.level}`);
  setText("nextLevelXp", `${xp.nextLevelXp}EXP`);
  setText("inputStreakCount", `${streak}日`);
  setText("inputTodayXp", `${todayXp()}EXP`);
  setText("targetAge", `${state.profile.targetAge}歳`);
  setText("monthlyAssetDiff", formatDiff(state.lastMonthlyChange?.diff));
  setText("monthlyAssetRate", formatPercent(monthlyAssetRateChange()));
  setText("settingsMonthlyDiff", formatDiff(state.lastMonthlyChange?.diff));
  setText("monthlyAutoLabel", `${formatCurrentMonthLabel()}として自動記録`);
  setText("monthlyFireDelta", formatFireDaysDiff(monthlyComparison().fireAgeDiffValue));
  setText("todayShortening", formatImpactDays(todayShorteningDays()));
  setText("yearlyShortening", formatShortening(yearlyShorteningDays()));
  setText("nextOnePercentAmount", nextOnePercentAmount() ? `あと${yen.format(nextOnePercentAmount())}` : "達成済み");
  setSignedClass("monthlyAssetDiff", state.lastMonthlyChange?.diff);
  setSignedClass("monthlyAssetRate", monthlyAssetRateChange());
  setSignedClass("yearlyAssetDiffResult", yearly.assetDiff);
  setSignedClass("peerAverageDiff", peerAverage ? total - peerAverage : null);
  setText("fireProgressLabel", `${rate}%`);
  document.getElementById("fireProgress").style.width = `${rate}%`;
  document.getElementById("levelProgress").style.width = `${xp.currentLevelXp}%`;
  renderFireProjection();
  hydrateDateInputs();

  const selectedEntries = progressEntriesForDate(selectedProgressDate());
  setText("todayLimit", `${selectedEntries.length} / ${dailyEntryLimit}`);
  const entriesToday = todayEntries();
  setText("todayHighlight", entriesToday[0] ? `${entriesToday[0].text} +${progressXp(entriesToday[0])}EXP` : "今日の前進をひとつ積む");
  document.getElementById("progressInput").disabled = selectedEntries.length >= dailyEntryLimit;
  document.querySelector("#progressForm button").disabled = selectedEntries.length >= dailyEntryLimit;

  renderSideHustles();
  renderDividendPower();
  renderOutcomeFormOptions();
  renderOutcomeHistory();
  renderAssets();
  renderAssetTrend();
  renderTodayQuests();
  renderJourney();
  renderVictoryConditions();
  renderHistory();
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
  if (days >= 365) return `${(days / 365).toFixed(1)}年`;
  return `${days}日`;
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
        <b>+${progressXp(entry)}EXP</b>
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
  const items = [
    { label: "家族ディナー", cost: 15000, unit: "回" },
    { label: "温泉旅行 家族4人", cost: 180000, unit: "回" },
    { label: "国内旅行 家族4人", cost: 300000, unit: "回" },
    { label: "海外旅行 家族4人", cost: 900000, unit: "回" }
  ];

  container.innerHTML = items.map((item) => {
    const status = dividendPurchaseStatus(annualDividend, item);
    return `
      <div class="dividend-power-row ${status.className}">
        <span>${item.label}</span>
        <small>${yen.format(item.cost)}</small>
        <strong>${status.label}</strong>
      </div>
    `;
  }).join("");
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
      <div><span>副業売上</span><strong>+${yen.format(totals.sales)}</strong></div>
      <div><span>副業利益</span><strong>+${yen.format(totals.profit)}</strong></div>
      <div><span>節約</span><strong>+${yen.format(totals.saving)}</strong></div>
      <div class="impact-total"><span>利益＋節約</span><strong>+${yen.format(totals.total)}</strong></div>
      <div class="impact-fire"><span>FIRE短縮</span><strong>${formatImpactDays(days)}</strong></div>
    </section>
  `;
}

function formatImpactDays(days) {
  if (days === 0) return "0日";
  if (days < 0.1) return "0.1日未満";
  return `${days.toFixed(1)}日`;
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
  const type = form.elements.type.value === "saving" ? "saving" : "profit";
  document.getElementById("outcomeCategorySuggestions").innerHTML = outcomeCategories[type]
    .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    .join("");
  form.elements.category.placeholder = type === "saving" ? "例: スタバを我慢" : "例: ゲーム販売";
  form.querySelector("[data-sales-field]").hidden = type === "saving";
  setText("outcomeAmountLabel", type === "saving" ? "節約額" : "利益");
}

function renderOutcomeHistory() {
  const container = document.getElementById("outcomeHistory");
  const entries = [...state.outcomeEntries].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  if (!entries.length) {
    container.innerHTML = '<p class="outcome-empty">成果を記録すると、FIRE短縮がここに積み上がります</p>';
    return;
  }
  container.innerHTML = entries.map((entry) => `
    <div class="outcome-row">
      <div class="outcome-main">
        <strong>${escapeHtml(entry.category)}</strong>
        <small>${formatEntryDate(entry.date)}・${entry.type === "profit" ? "副業利益" : "節約"}</small>
      </div>
      <div class="outcome-values">
        <span>+${yen.format(entry.amount)}</span>
        <b>${formatImpactDays(exactDaysShortenedByAmount(entry.amount))}短縮</b>
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

function monthlyAiStudyMinutes() {
  return monthlyProgressEntries().reduce((sum, entry) => {
    if (!entry.text.includes("AI学習")) return sum;
    const match = entry.text.match(/(\d+)\s*分/);
    return sum + (match ? Number(match[1]) : 30);
  }, 0);
}

function monthlyVictoryConditions() {
  const assetDiff = state.lastMonthlyChange?.diff || diffFromSnapshot(findSnapshot(previousMonthKey(currentMonthKey())), "total", totalAssets());
  const savings = outcomeTotals(outcomeEntriesFor("month")).saving;
  const aiMinutes = monthlyAiStudyMinutes();

  return [
    { label: "副業利益", current: monthlySideProfit(), target: 10000, unit: "money" },
    { label: "資産増加", current: assetDiff, target: 50000, unit: "money" },
    { label: "節約", current: savings, target: 5000, unit: "money" },
    { label: "AI学習", current: aiMinutes, target: 600, unit: "time" }
  ];
}

function renderVictoryConditions() {
  const conditions = monthlyVictoryConditions();
  const achieved = conditions.filter((item) => item.current >= item.target).length;
  setText("victoryRate", `${Math.round((achieved / conditions.length) * 100)}%`);
  document.getElementById("victoryList").innerHTML = conditions
    .map((item) => {
      const done = item.current >= item.target;
      const current = item.unit === "time" ? `${roundOne(item.current / 60)}時間` : yen.format(item.current);
      const target = item.unit === "time" ? `${roundOne(item.target / 60)}時間` : yen.format(item.target);
      return `
        <div class="victory-row ${done ? "is-done" : ""}">
          <span>${done ? "OK" : ""}</span>
          <strong>${item.label}</strong>
          <b>${current} / ${target}</b>
        </div>
      `;
    })
    .join("");
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
  const progressCount = monthlyProgressEntries().length;
  const xp = monthlyProgressEntries().reduce((sum, entry) => sum + progressXp(entry), 0);
  const shortened = monthlyShorteningDays();

  return {
    title: `${monthLabel}の冒険記録`,
    body: `資産 ${formatDiff(assetDiff)}、配当 ${formatDiff(dividendDiff)}、前進 ${progressCount}件 / ${xp}EXP。FIREまで${formatShortening(shortened)}短縮。着実に過去の自分を上回る1か月です。`
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
        <strong class="xp-badge">+${progressXp(entry)}EXP</strong>
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
  const progressDate = document.getElementById("progressDate");
  const outcomeDate = document.getElementById("outcomeForm").elements.date;
  progressDate.max = todayKey();
  outcomeDate.max = todayKey();
  if (!progressDate.value) progressDate.value = todayKey();
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

function parseInputNumber(value) {
  return Number(String(value || "").replace(/[^\d]/g, "")) || 0;
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

function showOutcomeStatus(message) {
  const status = document.getElementById("outcomeStatus");
  status.textContent = message;
  window.clearTimeout(outcomeStatusTimer);
  outcomeStatusTimer = window.setTimeout(() => {
    status.textContent = "";
  }, 2400);
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

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

document.getElementById("progressForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("progressInput");
  const text = input.value.trim();
  if (!addProgress(text, selectedProgressDate())) return;
  input.value = "";
});

document.getElementById("progressDate").addEventListener("change", () => {
  renderTodayQuests();
  const entries = progressEntriesForDate(selectedProgressDate());
  setText("todayLimit", `${entries.length} / ${dailyEntryLimit}`);
  document.getElementById("progressInput").disabled = entries.length >= dailyEntryLimit;
  document.querySelector("#progressForm button").disabled = entries.length >= dailyEntryLimit;
});

document.querySelectorAll("[data-quick-progress]").forEach((button) => {
  button.addEventListener("click", () => {
    addProgress(button.dataset.quickProgress, selectedProgressDate());
  });
});

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
  if (!event.target.matches("[data-number-input]")) return;
  event.target.value = formatNumericInputValue(event.target.value);
});

document.getElementById("outcomeForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const type = form.elements.type.value === "saving" ? "saving" : "profit";
  const amount = parseInputNumber(form.elements.amount.value);
  const sales = type === "profit" ? parseInputNumber(form.elements.sales.value) : 0;
  if (amount <= 0) {
    showOutcomeStatus(type === "profit" ? "利益を入力してください" : "節約額を入力してください");
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
    sales,
    amount,
    appliedToMonthlyTotals: false
  };
  state.outcomeEntries.push(entry);

  saveState();
  form.reset();
  render();
  showOutcomeStatus(`${yen.format(amount)}の成果でFIREを${formatImpactDays(exactDaysShortenedByAmount(amount))}短縮`);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-progress]");
  if (!button) return;
  deleteProgress(button.dataset.deleteProgress);
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-outcome]");
  if (!button) return;
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

  const xp = xpForProgress(trimmed);
  state.progressEntries.unshift({ text: trimmed, date: entryDate, xp, id: createProgressId({ text: trimmed, date: entryDate, xp }, Date.now()) });
  state.totalXp = (Number(state.totalXp) || inferTotalXp(state.progressEntries.slice(1))) + xp;
  saveState();
  render();
  showDailyStatus(`+${xp}EXP 記録しました`);
  return true;
}

function deleteProgress(id) {
  const beforeLength = state.progressEntries.length;
  state.progressEntries = state.progressEntries.filter((entry) => entry.id !== id);
  if (state.progressEntries.length === beforeLength) return;
  state.totalXp = inferTotalXp(state.progressEntries);
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
  state.assets.dividends = parseInputNumber(form.elements.dividends.value);
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
