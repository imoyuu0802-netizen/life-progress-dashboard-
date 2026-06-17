const storageKey = "life-progress-dashboard-v1";

const defaultState = {
  profile: {
    currentAge: 29,
    targetAge: 45,
    yearlyAssetGrowth: 1200000,
    fireGoal: 50000000
  },
  assets: {
    investments: 4200000,
    cash: 1300000,
    dividends: 96000
  },
  assetHistory: [],
  sideHustles: [
    { name: "ゲーム販売", sales: 48000, profit: 32000, previousProfit: 24000 },
    { name: "Totebell", sales: 18000, profit: 9000, previousProfit: 5000 },
    { name: "その他副業", sales: 12000, profit: 7000, previousProfit: 9000 }
  ],
  lastUpdatedAt: null,
  lastMonthlyChange: null,
  totalXp: 0,
  progressEntries: []
};

let state = loadState();
let currentView = localStorage.getItem("life-progress-view") || "overview";
let saveStatusTimer = null;
let dailyStatusTimer = null;
let backupStatusTimer = null;

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
    const saved = JSON.parse(raw);
    const progressEntries = migrateProgressEntries(saved.progressEntries || []);
    return {
      ...cloneDefaultState(),
      ...saved,
      profile: { ...defaultState.profile, ...(saved.profile || {}) },
      assets: { ...defaultState.assets, ...(saved.assets || {}) },
      assetHistory: normalizeAssetHistory(saved.assetHistory || []),
      sideHustles: saved.sideHustles || cloneDefaultState().sideHustles,
      totalXp: Number(saved.totalXp) || inferTotalXp(progressEntries),
      progressEntries
    };
  } catch {
    return cloneDefaultState();
  }
}

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function migrateProgressEntries(entries) {
  const sampleTexts = ["ゲーム出品1件", "AI学習30分"];
  const isOldSampleData =
    entries.length === 2 &&
    entries.every((entry) => entry.date === todayKey() && sampleTexts.includes(entry.text));

  return isOldSampleData ? [] : entries;
}

function normalizeAssetHistory(history) {
  return history
    .filter((item) => item && typeof item.month === "string")
    .map((item) => ({
      month: item.month.slice(0, 7),
      total: Number(item.total) || 0
    }))
    .filter((item) => item.month && item.total >= 0)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);
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

function arrivalAge() {
  const remaining = remainingToFire();
  const annualGrowth = annualFirePower();
  const yearsLeft = Math.ceil(remaining / annualGrowth);
  return state.profile.currentAge + yearsLeft;
}

function yearsToTargetAge() {
  return Math.max(0, state.profile.targetAge - state.profile.currentAge);
}

function monthlyProgressEntries() {
  const month = todayKey().slice(0, 7);
  return state.progressEntries.filter((entry) => entry.date.startsWith(month));
}

function todayEntries() {
  return state.progressEntries.filter((entry) => entry.date === todayKey());
}

function xpForProgress(text) {
  if (text.includes("Totebell")) return 20;
  if (text.includes("AI学習")) return 15;
  if (text.includes("ゲーム出品")) return 10;
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
  const monthlyProfit = state.sideHustles.reduce((sum, item) => sum + item.profit, 0);
  return Math.max(1, state.profile.yearlyAssetGrowth + state.assets.dividends + monthlyProfit * 12);
}

function baseAnnualFirePower() {
  return Math.max(1, state.profile.yearlyAssetGrowth + state.assets.dividends);
}

function fireAgeWithAnnualPower(annualPower) {
  const yearsLeft = Math.ceil(remainingToFire() / Math.max(1, annualPower));
  return state.profile.currentAge + yearsLeft;
}

function targetShortenYears() {
  return Math.max(0, arrivalAge() - state.profile.targetAge);
}

function daysShortenedByAmount(amount) {
  return Math.max(0, Math.round((amount / annualFirePower()) * 365));
}

function monthlyShorteningDays() {
  const monthlyProfit = state.sideHustles.reduce((sum, item) => sum + item.profit, 0);
  const diff = state.lastMonthlyChange?.diff || 0;
  return daysShortenedByAmount(Math.max(0, monthlyProfit + diff));
}

function calcScores() {
  const rate = fireRate();
  const monthlyProfit = state.sideHustles.reduce((sum, item) => sum + item.profit, 0);
  const todayCount = todayEntries().length;
  const creativeXp = state.progressEntries
    .filter((entry) => /Totebell|AI学習/.test(entry.text))
    .reduce((sum, entry) => sum + progressXp(entry), 0);
  const streak = streakDays();

  return [
    { label: "自由", value: clamp(Math.round(rate * 0.7 + monthlyProfit / 2500 + state.assets.dividends / 7000)), note: "資産・副業・配当" },
    { label: "創造", value: clamp(Math.round(todayCount * 18 + creativeXp / 12 + monthlyProfit / 3500)), note: "発信・AI・制作" },
    { label: "持続可能性", value: clamp(Math.round(42 + streak * 8 + todayCount * 8)), note: "継続・余白・生活" }
  ];
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function render() {
  const total = totalAssets();
  const rate = fireRate();
  const xp = levelInfo();
  const streak = streakDays();
  const shorteningYears = targetShortenYears();

  setText("fireRate", `${rate}%`);
  setText("shortenGap", `${shorteningYears}年`);
  setText("totalAssets", yen.format(total));
  setText("arrivalAge", `${arrivalAge()}歳`);
  setText("fireShortenMessage", `目標45歳まで、あと${shorteningYears}年短縮`);
  setText("levelLabel", `Lv.${xp.level}`);
  setText("nextLevelXp", `${xp.nextLevelXp}XP`);
  setText("streakCount", `${streak}日`);
  setText("inputStreakCount", `${streak}日`);
  setText("todayXp", `${todayXp()}XP`);
  setText("inputTodayXp", `${todayXp()}XP`);
  setText("targetAge", `${state.profile.targetAge}歳`);
  setText("monthlyShortening", `${monthlyShorteningDays()}日`);
  setText("monthlyProgressCount", `${monthlyProgressEntries().length}件`);
  setText("lastUpdated", `前回更新 ${formatUpdatedAt(state.lastUpdatedAt)}`);
  setText("remainingToFire", yen.format(remainingToFire()));
  setText("monthlyAssetDiff", formatDiff(state.lastMonthlyChange?.diff));
  setText("settingsMonthlyDiff", formatDiff(state.lastMonthlyChange?.diff));
  document.getElementById("fireProgress").style.width = `${rate}%`;
  document.getElementById("levelProgress").style.width = `${xp.currentLevelXp}%`;

  const entriesToday = todayEntries();
  setText("todayLimit", `${entriesToday.length} / 3`);
  setText("todayHighlight", entriesToday[0] ? `${entriesToday[0].text} +${progressXp(entriesToday[0])}XP` : "今日の前進をひとつ積む");
  document.getElementById("progressInput").disabled = entriesToday.length >= 3;
  document.querySelector("#progressForm button").disabled = entriesToday.length >= 3;

  renderSideHustles();
  renderAssets();
  renderAssetTrend();
  renderHistory();
  renderScores();
  hydrateSettings();
  switchView(currentView);
}

function setText(id, text) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = text;
}

function renderSideHustles() {
  const list = document.getElementById("sideHustleList");
  list.innerHTML = state.sideHustles
    .map((item, index) => {
      const diff = item.profit - item.previousProfit;
      const diffClass = diff < 0 ? "delta down" : "delta";
      const sign = diff >= 0 ? "+" : "";
      const progress = sideQuestProgress(item, index);
      return `
        <div class="quest-item">
          <div class="quest-name">
            <strong>${escapeHtml(item.name)}</strong>
            <small>${escapeHtml(progress.label)}</small>
            <div class="quest-progress"><span style="width:${progress.value}%"></span></div>
          </div>
          <div class="quest-values">
            <strong>${yen.format(item.profit)}</strong>
            <span class="${diffClass}">${daysShortenedByAmount(Math.max(0, item.profit))}日短縮</span>
            <span class="${diffClass}">前月比 ${sign}${yen.format(diff)}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function sideQuestProgress(item, index) {
  if (index === 0) {
    return {
      label: `利益目標 ${numberFormatter.format(Math.min(100, Math.round((item.profit / 20000) * 100)))}%`,
      value: clamp(Math.round((item.profit / 20000) * 100))
    };
  }

  if (index === 1) {
    return {
      label: item.profit > 0 ? "初売上達成 1 / 1" : "初売上達成 0 / 1",
      value: item.profit > 0 ? 100 : 0
    };
  }

  const streak = streakDays();
  return {
    label: `7日連続学習 ${Math.min(7, streak)} / 7`,
    value: clamp(Math.round((streak / 7) * 100))
  };
}

function renderAssets() {
  const values = [
    ["投資資産", "investments", state.assets.investments],
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
      { month: previousMonthKey(currentMonth), total: state.lastMonthlyChange.previousTotal },
      { month: currentMonth, total: totalAssets() }
    ];
  }

  if (!history.some((item) => item.month === currentMonth)) {
    history.push({ month: currentMonth, total: totalAssets() });
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
  note.textContent = items.length >= 2 ? "直近の月次更新から自動で表示" : "月次更新で推移が育ちます";
  chart.innerHTML = items
    .map((item) => {
      const height = Math.max(8, Math.round((item.total / maxTotal) * 100));
      return `
        <div class="bar-item">
          <div class="bar-value">${yen.format(item.total)}</div>
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
  const [, month] = monthKey.split("-");
  return `${Number(month)}月`;
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
        <strong class="xp-badge">+${progressXp(entry)}XP</strong>
      </div>
    `)
    .join("");
}

function renderScores() {
  document.getElementById("scoreList").innerHTML = calcScores()
    .map((score) => `
      <div class="score-item">
        <div class="score-meta">
          <strong>${score.label}</strong>
          <small>${score.note}</small>
        </div>
        <div class="score-bar"><span style="width:${score.value}%"></span></div>
        <strong class="score-value">${score.value}</strong>
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
  form.elements.investments.value = formatInputNumber(state.assets.investments);
  form.elements.cash.value = formatInputNumber(state.assets.cash);
  form.elements.dividends.value = formatInputNumber(state.assets.dividends);
  form.elements.fireGoal.value = formatInputNumber(state.profile.fireGoal);
  form.elements.yearlyAssetGrowth.value = formatInputNumber(state.profile.yearlyAssetGrowth);
  document.getElementById("sideHustleSettings").innerHTML = state.sideHustles
    .map((item, index) => `
      <div class="side-setting-card">
        <strong>${escapeHtml(item.name)}</strong>
        <div class="side-setting-fields">
          <label>
            <span>今月売上</span>
            <input name="side-${index}-sales" type="text" inputmode="numeric" data-number-input autocomplete="off" value="${formatInputNumber(item.sales)}" />
          </label>
          <label>
            <span>今月利益</span>
            <input name="side-${index}-profit" type="text" inputmode="numeric" data-number-input autocomplete="off" value="${formatInputNumber(item.profit)}" />
          </label>
          <label>
            <span>前月利益</span>
            <input name="side-${index}-previousProfit" type="text" inputmode="numeric" data-number-input autocomplete="off" value="${formatInputNumber(item.previousProfit)}" />
          </label>
        </div>
      </div>
    `)
    .join("");
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

function showSaveStatus() {
  const status = document.getElementById("saveStatus");
  status.textContent = "保存しました";
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

function exportBackup() {
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
  URL.revokeObjectURL(link.href);
  showBackupStatus("バックアップを書き出しました");
}

function importBackupFile(file) {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(reader.result);
      const importedState = parsed.state || parsed;
      state = {
        ...cloneDefaultState(),
        ...importedState,
        profile: { ...defaultState.profile, ...(importedState.profile || {}) },
        assets: { ...defaultState.assets, ...(importedState.assets || {}) },
        assetHistory: normalizeAssetHistory(importedState.assetHistory || []),
        sideHustles: importedState.sideHustles || cloneDefaultState().sideHustles,
        totalXp: Number(importedState.totalXp) || inferTotalXp(importedState.progressEntries || []),
        progressEntries: importedState.progressEntries || []
      };
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
  if (!addProgress(text)) return;
  input.value = "";
});

document.querySelectorAll("[data-quick-progress]").forEach((button) => {
  button.addEventListener("click", () => {
    addProgress(button.dataset.quickProgress);
  });
});

document.querySelectorAll("[data-view-target]").forEach((button) => {
  button.addEventListener("click", () => {
    switchView(button.dataset.viewTarget);
  });
});

document.getElementById("settingsForm").addEventListener("input", (event) => {
  if (!event.target.matches("[data-number-input]")) return;
  event.target.value = formatNumericInputValue(event.target.value);
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

function addProgress(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (todayEntries().length >= 3) {
    showDailyStatus("今日は3件まで記録済み");
    return false;
  }

  const xp = xpForProgress(trimmed);
  state.progressEntries.unshift({ text: trimmed, date: todayKey(), xp });
  state.totalXp = (Number(state.totalXp) || inferTotalXp(state.progressEntries.slice(1))) + xp;
  saveState();
  render();
  switchView("input");
  showDailyStatus(`+${xp}XP 記録しました`);
  return true;
}

function switchView(viewName) {
  currentView = viewName;
  localStorage.setItem("life-progress-view", viewName);
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("is-active", view.id === `view-${viewName}`);
  });
  document.querySelectorAll("[data-view-target]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.viewTarget === viewName);
  });
}

function recordAssetSnapshot(previousTotal, currentTotal) {
  const month = currentMonthKey();
  let history = normalizeAssetHistory(state.assetHistory || []);

  if (!history.length && previousTotal !== currentTotal) {
    history.push({ month: previousMonthKey(month), total: previousTotal });
  }

  history = history.filter((item) => item.month !== month);
  history.push({ month, total: currentTotal });
  state.assetHistory = normalizeAssetHistory(history);
}

document.getElementById("settingsForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const previousTotal = totalAssets();
  state.assets.investments = parseInputNumber(form.elements.investments.value);
  state.assets.cash = parseInputNumber(form.elements.cash.value);
  state.assets.dividends = parseInputNumber(form.elements.dividends.value);
  state.profile.fireGoal = Math.max(1, parseInputNumber(form.elements.fireGoal.value));
  state.profile.yearlyAssetGrowth = parseInputNumber(form.elements.yearlyAssetGrowth.value);
  state.sideHustles = state.sideHustles.map((item, index) => ({
    ...item,
    sales: parseInputNumber(form.elements[`side-${index}-sales`].value),
    profit: parseInputNumber(form.elements[`side-${index}-profit`].value),
    previousProfit: parseInputNumber(form.elements[`side-${index}-previousProfit`].value)
  }));
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

render();
