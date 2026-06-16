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
  sideHustles: [
    { name: "ゲーム販売", sales: 48000, profit: 32000, previousProfit: 24000 },
    { name: "Totebell", sales: 18000, profit: 9000, previousProfit: 5000 },
    { name: "その他副業", sales: 12000, profit: 7000, previousProfit: 9000 }
  ],
  lastUpdatedAt: null,
  lastMonthlyChange: null,
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
  return new Date().toISOString().slice(0, 10);
}

function loadState() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return cloneDefaultState();

  try {
    const saved = JSON.parse(raw);
    return {
      ...cloneDefaultState(),
      ...saved,
      profile: { ...defaultState.profile, ...(saved.profile || {}) },
      assets: { ...defaultState.assets, ...(saved.assets || {}) },
      sideHustles: saved.sideHustles || cloneDefaultState().sideHustles,
      progressEntries: migrateProgressEntries(saved.progressEntries || [])
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
  const annualGrowth = Math.max(1, state.profile.yearlyAssetGrowth + state.assets.dividends);
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

function calcScores() {
  const rate = fireRate();
  const monthlyProfit = state.sideHustles.reduce((sum, item) => sum + item.profit, 0);
  const todayCount = todayEntries().length;

  return [
    { label: "自由", value: clamp(Math.round(rate * 0.75 + state.assets.dividends / 6000)) },
    { label: "創造", value: clamp(Math.round(todayCount * 22 + monthlyProfit / 1800)) },
    { label: "持続可能性", value: clamp(Math.round(rate * 0.45 + todayCount * 12 + 38)) }
  ];
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function render() {
  const total = totalAssets();
  const rate = fireRate();
  const monthlyDividend = Math.round(state.assets.dividends / 12);

  setText("fireRate", `${rate}%`);
  setText("totalAssets", yen.format(total));
  setText("fireGoal", yen.format(state.profile.fireGoal));
  setText("arrivalAge", `${arrivalAge()}歳`);
  setText("annualDividend", yen.format(state.assets.dividends));
  setText("monthlyDividend", yen.format(monthlyDividend));
  setText("monthlyProgressCount", `${monthlyProgressEntries().length}件`);
  setText("lastUpdated", `前回更新 ${formatUpdatedAt(state.lastUpdatedAt)}`);
  setText("remainingToFire", yen.format(remainingToFire()));
  setText("nextOnePercent", yen.format(nextOnePercentAmount()));
  setText("yearsToTarget", `${yearsToTargetAge()}年`);
  setText("monthlyAssetDiff", formatDiff(state.lastMonthlyChange?.diff));
  setText("settingsMonthlyDiff", formatDiff(state.lastMonthlyChange?.diff));
  document.getElementById("fireProgress").style.width = `${rate}%`;

  const entriesToday = todayEntries();
  setText("todayLimit", `${entriesToday.length} / 3`);
  setText("todayHighlight", entriesToday[0]?.text || "今日の前進をひとつ積む");
  document.getElementById("progressInput").disabled = entriesToday.length >= 3;
  document.querySelector("#progressForm button").disabled = entriesToday.length >= 3;

  renderSideHustles();
  renderAssets();
  renderHistory();
  renderScores();
  hydrateSettings();
  switchView(currentView);
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

function renderSideHustles() {
  const list = document.getElementById("sideHustleList");
  list.innerHTML = state.sideHustles
    .map((item) => {
      const diff = item.profit - item.previousProfit;
      const diffClass = diff < 0 ? "delta down" : "delta";
      const sign = diff >= 0 ? "+" : "";
      return `
        <div class="quest-item">
          <div class="quest-name">
            <strong>${escapeHtml(item.name)}</strong>
            <small>今月売上 ${yen.format(item.sales)}</small>
          </div>
          <div class="quest-values">
            <strong>${yen.format(item.profit)}</strong>
            <span class="${diffClass}">前月比 ${sign}${yen.format(diff)}</span>
          </div>
        </div>
      `;
    })
    .join("");
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

function renderHistory() {
  const history = document.getElementById("progressHistory");
  const entries = state.progressEntries.slice(0, 5);
  history.innerHTML = entries
    .map((entry) => `
      <div class="history-item">
        <div class="history-main">
          <strong>${escapeHtml(entry.text)}</strong>
          <span class="history-date">${entry.date}</span>
        </div>
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
          <small>${score.value} / 100</small>
        </div>
        <div class="score-bar"><span style="width:${score.value}%"></span></div>
        <strong class="score-value">${score.value}</strong>
      </div>
    `)
    .join("");
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
        sideHustles: importedState.sideHustles || cloneDefaultState().sideHustles,
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

  state.progressEntries.unshift({ text: trimmed, date: todayKey() });
  saveState();
  render();
  switchView("input");
  showDailyStatus("記録しました");
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
  state.lastUpdatedAt = new Date().toISOString();
  saveState();
  render();
  showSaveStatus();
});

render();
