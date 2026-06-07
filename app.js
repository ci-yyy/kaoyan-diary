// ============================================================
//  考研日记 · 倒计时 — app.js
//  优化版本：8.4 代码拆分 + 8.5 性能 + 8.6 存储 + 8.7 无障碍 + 8.8 可视化
// ============================================================

// ============================================================
//  Config
// ============================================================
const EXAM_DATE = '2026-12-19'; // 考研初试
const WEEKDAYS = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];

const DEFAULT_SUBJECTS = [
  { emoji: '📖', name: '政治', key: 'politics', maxScore: 100, color: '#c0392b' },
  { emoji: '📝', name: '英语', key: 'english', maxScore: 100, color: '#2980b9' },
  { emoji: '🧮', name: '数学', key: 'math', maxScore: 150, color: '#27ae60' },
  { emoji: '🔬', name: '专业课', key: 'specialty', maxScore: 150, color: '#c9a84c' },
];

// Achievements
const ACHIEVEMENTS = [
  { id: 'streak3', emoji: '🔥', title: '坚持三天', desc: '连续学习 3 天' },
  { id: 'streak7', emoji: '💪', title: '一周不断', desc: '连续学习 7 天' },
  { id: 'streak14', emoji: '🏆', title: '自律达人', desc: '连续学习 14 天' },
  { id: 'streak30', emoji: '👑', title: '一个月来风雨无阻', desc: '连续学习 30 天' },
  { id: 'hours50', emoji: '⭐', title: '五十小时', desc: '累计学习 50 小时' },
  { id: 'hours100', emoji: '🌟', title: '破百小时', desc: '累计学习 100 小时' },
  { id: 'hours300', emoji: '💎', title: '三百小时', desc: '累计学习 300 小时' },
  { id: 'hours500', emoji: '⚡', title: '五百小时大神', desc: '累计学习 500 小时' },
  { id: 'day8h', emoji: '🚀', title: '八小时日', desc: '单日学习 8 小时以上' },
  { id: 'day10h', emoji: '🦾', title: '十小时日', desc: '单日学习 10 小时以上' },
  { id: 'diary10', emoji: '📚', title: '日记十篇', desc: '写了 10 篇日记' },
  { id: 'diary50', emoji: '📖', title: '日记半百', desc: '写了 50 篇日记' },
];
let unlockedAchievements = {};

function checkAchievements() {
  const dates = Object.keys(diaryData).sort();
  let totalSec = 0, maxDay = 0;
  let streak = 0, bestStreak = 0;
  dates.forEach(d => {
    const p = diaryData[d];
    const ds = p.study ? Object.values(p.study).reduce((a,b)=>a+b,0) : 0;
    totalSec += ds;
    if (ds > maxDay) maxDay = ds;
    if (ds > 0) streak++;
    else { if (streak > bestStreak) bestStreak = streak; streak = 0; }
  });
  if (streak > bestStreak) bestStreak = streak;

  const totalHours = totalSec / 3600;
  const diaryCount = dates.filter(d => diaryData[d]?.text?.trim()).length;

  const checks = {
    streak3: bestStreak >= 3, streak7: bestStreak >= 7,
    streak14: bestStreak >= 14, streak30: bestStreak >= 30,
    hours50: totalHours >= 50, hours100: totalHours >= 100,
    hours300: totalHours >= 300, hours500: totalHours >= 500,
    day8h: maxDay >= 28800, day10h: maxDay >= 36000,
    diary10: diaryCount >= 10, diary50: diaryCount >= 50,
  };

  let unlocked = [];
  Object.entries(checks).forEach(([id, ok]) => {
    if (ok && !unlockedAchievements[id]) {
      unlockedAchievements[id] = true;
      unlocked.push(id);
    }
  });
  if (unlocked.length) {
    try { localStorage.setItem('ky_achievements', JSON.stringify(unlockedAchievements)); } catch {}
    unlocked.forEach(id => {
      const a = ACHIEVEMENTS.find(ac => ac.id === id);
      if (a) showAchievement(a);
    });
  }
}

function showAchievement(a) {
  const el = document.createElement('div');
  el.setAttribute('role', 'alert');
  el.setAttribute('aria-live', 'polite');
  const isDark = document.documentElement.classList.contains('dark');
  el.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-120px);z-index:300;background:'+(isDark?'#2a2a38':'#fffdf5')+';border:1px solid '+(isDark?'#444':'#e2d9c8')+';border-radius:14px;padding:14px 24px;box-shadow:0 8px 40px rgba(0,0,0,0.2);text-align:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif;transition:transform 0.5s cubic-bezier(.4,0,.2,1);pointer-events:none;';
  el.innerHTML = `<div style="font-size:32px;">${a.emoji}</div><div style="font-size:14px;font-weight:700;margin-top:4px;color:'+(isDark?'#ddd':'#2c2c2c')+';">🏅 ${a.title}</div><div style="font-size:12px;color:'+(isDark?'#999':'#8a8078')+';margin-top:2px;">${a.desc}</div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => {
    el.style.transform = 'translateX(-50%) translateY(-120px)';
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 600);
  }, 3000);
}

const QUOTES = [
  '每一个努力的今天，都会在十二月开花结果',
  '考研路上，最大的敌人不是别人，是自己',
  '不积跬步，无以至千里；不积小流，无以成江海',
  '既然选择了远方，便只顾风雨兼程',
  '星光不问赶路人，时光不负有心人',
  '今天的汗水是明天的勋章',
  '坚持到最后，你就赢了大多数人',
  '每一个不曾起舞的日子，都是对生命的辜负',
  '考研不是因为有希望才坚持，而是坚持了才有希望',
  '乾坤未定，你我皆是黑马',
  '不要假装努力，结果不会陪你演戏',
  '你所做的事情，也许暂时看不到结果，但不要灰心',
  '慢慢来，比较快',
  '耐得住寂寞，才守得住繁华',
  '天下事有难易乎？为之，则难者亦易矣',
  '长风破浪会有时，直挂云帆济沧海',
  '大鹏一日同风起，扶摇直上九万里',
  '有志者，事竟成，破釜沉舟，百二秦关终属楚',
  '苦心人，天不负，卧薪尝胆，三千越甲可吞吴',
  '千里之行，始于足下',
  '博学之，审问之，慎思之，明辨之，笃行之',
  '业精于勤，荒于嬉；行成于思，毁于随',
  '路漫漫其修远兮，吾将上下而求索',
  '宝剑锋从磨砺出，梅花香自苦寒来',
  '千淘万漉虽辛苦，吹尽狂沙始到金',
  '山重水复疑无路，柳暗花明又一村',
  '欲穷千里目，更上一层楼',
  '会当凌绝顶，一览众山小',
  '黑发不知勤学早，白首方悔读书迟',
  '莫等闲，白了少年头，空悲切',
  '天行健，君子以自强不息',
  '积土成山，风雨兴焉；积水成渊，蛟龙生焉',
  '锲而不舍，金石可镂',
  '学而不思则罔，思而不学则殆',
  '温故而知新，可以为师矣',
  '志当存高远',
  '非学无以广才，非志无以成学',
  '学不可以已',
  '纸上得来终觉浅，绝知此事要躬行',
  '不畏浮云遮望眼，自缘身在最高层',
  '古之立大事者，不惟有超世之才，亦必有坚忍不拔之志',
  '十年磨一剑，霜刃未曾试',
  '千磨万击还坚劲，任尔东西南北风',
  '只要功夫深，铁杵磨成针',
  '书山有路勤为径，学海无涯苦作舟',
  '少壮不努力，老大徒伤悲',
  '问渠那得清如许，为有源头活水来',
  '不鸣则已，一鸣惊人',
  '知之者不如好之者，好之者不如乐之者',
  '少年辛苦终身事，莫向光阴惰寸功',
  '及时当勉励，岁月不待人',
  '学如逆水行舟，不进则退',
  '每一次挑灯夜战，都是为梦想积攒光亮',
  '你不是孤军奋战，无数人和你一样在拼搏',
  '焦虑的反面是行动',
  '比天赋更可怕的，是日复一日的坚持',
  '三四月做的事，八九月自会有答案',
  '所有的逆袭，都是有备而来',
  '与其仰望星空，不如脚踏实地',
  '你所羡慕的一切，背后都是你不曾熬过的苦',
  '人生如棋，落子无悔',
  '愿你在冷铁卷刃前，得以窥见天光',
  '愿你合上笔盖的那一刻，有剑客收刀入鞘的骄傲',
  '上岸，然后去看更大的世界',
  '当你在夜晚孤军奋战时，漫天星光因你而闪烁',
  '希望是我，最后是我，千万是我，必须是我',
  '跑得慢不代表跑不到终点',
  '身在井隅，心向星光',
  '你只管努力，剩下的交给时间',
  '人生没有白走的路，每一步都算数',
  '征途漫漫，唯有奋斗',
  '熬过无人问津的日子，才能拥抱诗和远方',
  '那些你独自努力的时光，终会让你变成闪耀的人',
  '把书读烂，把路走宽',
  '你背不下来的书，总有人能背下来',
  '一约既定，万山无阻',
  '行而不辍，未来可期',
];

// ============================================================
//  State
// ============================================================
let state = {
  date: '',
  todos: [],     // { id, text, createdAt }
  nextTaskId: 0,
  subjects: DEFAULT_SUBJECTS.map(s => ({ ...s })),
  goalSchool: '',
  goalMajor: '',
  goalScores: {},
  totalTargetHours: 500,
};

let diaryData = {};
let currentDate = '';
let activeTracking = null;
let trackingStart = null;
let trackingTick = null;

// ---- 8.5: Dirty flags for optimized rendering ----
let dirty = {
  subjects: true,
  miniSubjects: true,
  timeline: true,
  entryList: true,
  goals: true,
  charts: true,
};
function markDirty(keys) { keys.forEach(k => { dirty[k] = true; }); }
function markAllDirty() { Object.keys(dirty).forEach(k => { dirty[k] = true; }); }
// Track last session count for timeline optimization
let _lastSessionCount = -1;
let _lastActiveKey = null;
let _cachedTotalSecBase = -1;
let _cachedStudyDays = -1;

// ---- 8.5: rAF batching ----
let _rafPending = false;
let _pendingUpdates = [];
function scheduleUpdate(fn) {
  _pendingUpdates.push(fn);
  if (!_rafPending) {
    _rafPending = true;
    requestAnimationFrame(() => {
      _rafPending = false;
      const fns = _pendingUpdates;
      _pendingUpdates = [];
      fns.forEach(f => { try { f(); } catch(e) { console.error(e); } });
    });
  }
}

// ====== Totals cache ======
function _invalidateTotalsCache() { _cachedTotalSecBase = -1; _cachedStudyDays = -1; }

function getTotals() {
  if (_cachedTotalSecBase === -1) {
    let totalSec = 0, studyDays = 0;
    const allDates = Object.keys(diaryData);
    for (let i = 0; i < allDates.length; i++) {
      const p = diaryData[allDates[i]];
      if (p.study) {
        const ds = Object.values(p.study).reduce((a, b) => a + b, 0);
        totalSec += ds;
      }
      const hasText = p.text && p.text.trim().length > 0;
      const hasStudy = p.study && Object.values(p.study).reduce((a, b) => a + b, 0) > 0;
      if (hasText || hasStudy) studyDays++;
    }
    _cachedTotalSecBase = totalSec;
    _cachedStudyDays = studyDays;
  }
  let totalSec = _cachedTotalSecBase;
  if (activeTracking && trackingStart) {
    totalSec += Math.floor((Date.now() - trackingStart) / 1000);
  }
  return { totalSec, studyDays: _cachedStudyDays };
}

// ============================================================
//  DOM refs
// ============================================================
const $ = id => document.getElementById(id);
const countdownNum = $('countdownNum');
const countdownWeeks = $('countdownWeeks');
const countdownHours = $('countdownHours');
const examDateDisplay = $('examDateDisplay');
const subjectMiniList = $('subjectMiniList');
const entryList = $('entryList');
const diaryDate = $('diaryDate');
const diaryWeekday = $('diaryWeekday');
const subjectGrid = $('subjectGrid');
const diaryText = $('diaryText');
const wordCount = $('wordCount');
const diarySaveStatus = $('diarySaveStatus');
const diarySaveBtn = $('diarySaveBtn');
const navPrev = $('navPrev');
const navToday = $('navToday');
const navNext = $('navNext');
const goalSchool = $('goalSchool');
const goalMajor = $('goalMajor');
const headerGoalSubjects = $('headerGoalSubjects');
const todoGeneralInput = $('todoGeneralInput');
const todoGeneralList = $('todoGeneralList');
const addGeneralBtn = $('addGeneralBtn');
const todoDailyInput = $('todoDailyInput');
const todoDailyList = $('todoDailyList');
const addDailyBtn = $('addDailyBtn');
const notificationEl = $('notification');
const themeToggle = $('themeToggle');
const datePart = $('datePart');
const timePart = $('timePart');
const quoteBar = $('quoteBar');
const sideDailyProgress = $('sideDailyProgress');
const sideTotalProgress = $('sideTotalProgress');
const sideTotalBar = $('sideTotalBar');
const sideTotalDays = $('sideTotalDays');
const sideTotalPercent = $('sideTotalPercent');
const timelineList = $('timelineList');
const entrySearch = $('entrySearch');
const weeklyToggle = $('weeklyToggle');
const weeklyReport = $('weeklyReport');
const exportJSON = $('exportJSON');
const exportTXT = $('exportTXT');
const storageInfo = $('storageInfo');
const chartBarWeek = $('chartBarWeek');
const chartSubjectDist = $('chartSubjectDist');
const cleanupBtn = $('cleanupDataBtn');

// ============================================================
//  Helpers
// ============================================================
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDateLabel(s) {
  const d = new Date(s + 'T12:00:00');
  return `${d.getMonth()+1}月${d.getDate()}日`;
}

function getWeekday(s) { return WEEKDAYS[new Date(s + 'T12:00:00').getDay()]; }

function daysBetween(a, b) {
  const da = new Date(a + 'T12:00:00');
  const db = new Date(b + 'T12:00:00');
  return Math.round((db - da) / 86400000);
}

function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

function hms(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h${m}m` : `${m}m`;
}

// ============================================================
//  8.6: Storage size calculation
// ============================================================
function getStorageUsage() {
  let total = 0;
  try {
    ['ky_diary_state','ky_diary_pages','ky_achievements','ky_diary_theme','ky_month_collapsed'].forEach(k => {
      const v = localStorage.getItem(k);
      if (v) total += v.length * 2; // UTF-16 ~2 bytes per char
    });
  } catch {}
  return total;
}

function countDiaryDays() {
  return Object.keys(diaryData).filter(d => {
    const p = diaryData[d];
    const hasText = p.text && p.text.trim().length > 0;
    const hasStudy = p.study && Object.values(p.study).reduce((a,b)=>a+b,0) > 0;
    return hasText || hasStudy;
  }).length;
}

function updateStorageInfo() {
  if (!storageInfo) return;
  const bytes = getStorageUsage();
  const kb = (bytes / 1024).toFixed(1);
  const days = countDiaryDays();
  storageInfo.textContent = `${kb} KB · ${days} 天`;
}

// ============================================================
//  8.6: Session data truncation (keep last 30 days detailed)
// ============================================================
function truncateOldSessions() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth()+1).padStart(2,'0')}-${String(cutoff.getDate()).padStart(2,'0')}`;
  let trimmed = 0;
  Object.keys(diaryData).forEach(d => {
    if (d < cutoffStr && diaryData[d].sessions && diaryData[d].sessions.length > 0) {
      trimmed += diaryData[d].sessions.length;
      delete diaryData[d].sessions;
    }
  });
  return trimmed;
}

function manualCleanup() {
  const trimmed = truncateOldSessions();
  save();
  updateStorageInfo();
  if (trimmed > 0) {
    notify(`🧹 已清理 ${trimmed} 条旧学习记录明细（汇总数据保留）`);
  } else {
    notify('📦 没有需要清理的旧数据');
  }
}

// ============================================================
//  Server data sync (保存数据到 data.json)
// ============================================================
// 通过 server.py 启动本地服务器后，数据自动读写 data.json。
// 把整个文件夹复制到其他电脑，data.json 带着走，数据不丢。
// （如果直接双击 index.html 则只用 localStorage，不受影响）

const _SYNC_KEYS = ['ky_diary_state','ky_diary_pages','ky_achievements','ky_diary_theme','ky_month_collapsed'];
let _syncTimer = null;

function syncSaveToServer() {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    _syncTimer = null;
    try {
      const payload = {};
      _SYNC_KEYS.forEach(k => {
        const v = localStorage.getItem(k);
        if (v) payload[k] = v;
      });
      fetch('/api/save', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch {}
  }, 1500);
}

async function syncLoadFromServer() {
  try {
    const res = await fetch('/api/load');
    if (!res.ok) return 'empty';
    const data = await res.json();
    if (!data || Object.keys(data).length === 0) return 'empty';
    let changed = false;
    _SYNC_KEYS.forEach(k => {
      if (data[k] && localStorage.getItem(k) !== data[k]) {
        localStorage.setItem(k, data[k]);
        changed = true;
      }
    });
    return changed;
  } catch {
    return 'empty';
  }
}

async function initServerSync() {
  const result = await syncLoadFromServer();
  if (result === true) {
    load();
    markAllDirty();
    dirty.entryList = true;
    renderEntryList();
    renderTimeline();
    renderGoals();
    renderTodos();
    updateStorageInfo();
    updateCountdown();
    if (currentDate) loadDiary(currentDate);
  } else {
    syncSaveToServer();
  }
}

// ============================================================
//  Save / Load (with 8.6 QuotaExceededError handling)
// ============================================================
function save() {
  // Auto-truncate sessions older than 30 days
  truncateOldSessions();
  _invalidateTotalsCache();

  try {
    localStorage.setItem('ky_diary_state', JSON.stringify(state));
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      notify('⚠️ 存储空间不足！请导出数据后清理旧记录');
    }
  }
  try {
    localStorage.setItem('ky_diary_pages', JSON.stringify(diaryData));
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      notify('⚠️ 存储空间不足！请导出数据后点击"清理旧数据"');
      // Aggressive cleanup
      const trimmed = truncateOldSessions();
      if (trimmed > 0) {
        try { localStorage.setItem('ky_diary_pages', JSON.stringify(diaryData)); } catch {}
        notify(`⚠️ 已自动清理 ${trimmed} 条旧记录`);
      }
    }
  }

  // Update storage info in background
  scheduleUpdate(() => updateStorageInfo());

  // 同步到本地 data.json（服务器模式）
  syncSaveToServer();
}

function load() {
  try {
    const raw = localStorage.getItem('ky_diary_state');
    if (raw) {
      Object.assign(state, JSON.parse(raw));
      if (state.date !== todayStr()) {
        state.date = todayStr();
      }
    }
    // 旧数据迁移: {text, done} → {id, text, createdAt, deletedAt}
    if (state.todos.length > 0) {
      const first = state.todos[0];
      if (typeof first === 'object' && 'done' in first) {
        const old = state.todos;
        state.todos = old.map((t, i) => ({ id: i, text: t.text, createdAt: '2026-01-01', deletedAt: null }));
        state.nextTaskId = old.length;
      } else {
        // 确保已有 deletedAt 字段
        state.todos.forEach(t => { if (t.deletedAt === undefined) t.deletedAt = null; });
      }
    }
    if (!state.nextTaskId) state.nextTaskId = 0;
    try {
      const a = localStorage.getItem('ky_achievements');
      if (a) unlockedAchievements = JSON.parse(a);
    } catch {}

    // Ensure subjects have maxScore (migrate old data)
    const defaultMap = {};
    DEFAULT_SUBJECTS.forEach(s => { defaultMap[s.key] = s.maxScore; });
    const nameMap = { politics: '政治', english: '英语', math: '数学', specialty: '专业课' };
    const colorMap = { politics: '#c0392b', english: '#2980b9', math: '#27ae60', specialty: '#c9a84c' };
    state.subjects = state.subjects.map(s => ({
      ...s,
      maxScore: s.maxScore || defaultMap[s.key] || 100,
      name: nameMap[s.key] || s.name,
      color: colorMap[s.key] || s.color || '#c0392b',
    }));
  } catch {}

  try {
    const d = localStorage.getItem('ky_diary_pages');
    if (d) diaryData = JSON.parse(d);
  } catch {}

  // Auto-cleanup old sessions on load
  truncateOldSessions();
}

// ============================================================
//  Theme
// ============================================================
function initTheme() {
  const dark = localStorage.getItem('ky_diary_theme') === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  themeToggle.textContent = dark ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-label', dark ? '切换到浅色主题' : '切换到深色主题');
}
themeToggle.addEventListener('click', () => {
  const dark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('ky_diary_theme', dark ? 'dark' : 'light');
  themeToggle.textContent = dark ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-label', dark ? '切换到浅色主题' : '切换到深色主题');
});

// ============================================================
//  Clock
// ============================================================
function updateClock() {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth()+1, d = now.getDate();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const ss = String(now.getSeconds()).padStart(2,'0');
  datePart.textContent = `${y}年${m}月${d}日 `;
  timePart.textContent = `${hh}:${mm}:${ss}`;
}

// ============================================================
//  Countdown
// ============================================================
function updateCountdown() {
  const today = todayStr();
  const diff = daysBetween(today, EXAM_DATE);
  countdownNum.textContent = Math.max(0, diff);
  countdownWeeks.textContent = Math.max(0, Math.floor(diff / 7));
  countdownHours.textContent = Math.max(0, diff * 24);
  const ed = new Date(EXAM_DATE + 'T12:00:00');
  examDateDisplay.textContent = `📅 ${ed.getFullYear()}年${ed.getMonth()+1}月${ed.getDate()}日 · ${WEEKDAYS[ed.getDay()]}`;
}

// ============================================================
//  8.5: Study Stats / Mini Subjects — optimized rendering
// ============================================================

// Build the mini-subjects list HTML (heavy: only when dirty)
function renderMiniSubjectsFull() {
  const todayPage = diaryData[todayStr()] || { study: {} };
  const study = todayPage.study || {};
  let html = '';
  let totalMinutes = 0;
  state.subjects.forEach(s => {
    let sec = study[s.key] || 0;
    if (activeTracking === s.key && trackingStart) {
      sec += Math.floor((Date.now() - trackingStart) / 1000);
    }
    const min = Math.round(sec / 60);
    totalMinutes += min;
    if (min > 0) {
      const sc = s.color || 'var(--accent)';
      html += `<div class="subject-mini-item" data-sub="${s.key}">
        <span class="name"><span style="display:inline-block;width:5px;height:5px;border-radius:50%;background:${sc};margin-right:3px;"></span>${s.name}</span>
        <span class="hours" data-sub-hours="${s.key}">${hms(sec)}</span>
      </div>`;
    }
  });
  if (!html) {
    html = `<div style="text-align:center;padding:8px 0;font-size:12px;color:var(--ink-lighter);font-style:italic;">今天还没开始学习</div>`;
  } else {
    html += `<div class="subject-mini-total">
      <span>📊 今日总计</span>
      <span data-sub-total>${Math.round(totalMinutes)} 分钟</span>
    </div>`;
  }
  subjectMiniList.innerHTML = html;
  dirty.miniSubjects = false;
}

// Lightweight: only update time text nodes (called every tick)
function renderMiniSubjectsLight() {
  const todayPage = diaryData[todayStr()] || { study: {} };
  const study = todayPage.study || {};
  let totalMinutes = 0;
  let anyVisible = false;

  state.subjects.forEach(s => {
    let sec = study[s.key] || 0;
    if (activeTracking === s.key && trackingStart) {
      sec += Math.floor((Date.now() - trackingStart) / 1000);
    }
    if (sec > 0) anyVisible = true;
    const min = Math.round(sec / 60);
    totalMinutes += min;

    const hourEl = subjectMiniList.querySelector(`[data-sub-hours="${s.key}"]`);
    if (hourEl) {
      hourEl.textContent = hms(sec);
    }
  });

  const totalEl = subjectMiniList.querySelector('[data-sub-total]');
  if (totalEl) {
    totalEl.textContent = `${Math.round(totalMinutes)} 分钟`;
  }

  // If items appeared/disappeared, do full rebuild
  const hasItems = subjectMiniList.querySelector('.subject-mini-item');
  if ((anyVisible && !hasItems) || (!anyVisible && hasItems)) {
    dirty.miniSubjects = true;
  }
}

function renderMiniSubjects() {
  if (dirty.miniSubjects) {
    renderMiniSubjectsFull();
  } else {
    renderMiniSubjectsLight();
  }
}

// ============================================================
//  Diary Entry List (sidebar)
// ============================================================
let monthCollapsed = {};

function renderEntryList() {
  if (!dirty.entryList) return;
  const dates = Object.keys(diaryData).sort().reverse();
  if (!dates.length) {
    entryList.innerHTML = `<div style="text-align:center;color:var(--ink-lighter);font-size:12px;padding:20px 0;font-style:italic;">开始记录你的考研之旅 📝</div>`;
    dirty.entryList = false;
    return;
  }

  const q = (entrySearch.value || '').trim().toLowerCase();

  const groups = {};
  dates.forEach(d => {
    const page = diaryData[d];
    if (q) {
      const text = (page.text || '').toLowerCase();
      if (!text.includes(q) && !formatDateLabel(d).includes(q)) return;
    }
    const m = d.slice(0, 7);
    if (!groups[m]) groups[m] = [];
    groups[m].push(d);
  });

  const months = Object.keys(groups).sort().reverse();
  const currentMonth = todayStr().slice(0, 7);

  if (!months.length) {
    entryList.innerHTML = `<div style="text-align:center;color:var(--ink-lighter);font-size:12px;padding:20px 0;font-style:italic;">未找到匹配的日记</div>`;
    dirty.entryList = false;
    return;
  }

  let html = '';
  months.forEach(m => {
    const [year, month] = m.split('-');
    const label = `${year}年${parseInt(month)}月`;
    const days = groups[m];
    const isCurrent = m === currentMonth;

    if (monthCollapsed[m] === undefined) {
      monthCollapsed[m] = !isCurrent;
    }
    const collapsed = q ? false : monthCollapsed[m];

    html += `<div class="month-group" data-month="${m}" role="group" aria-label="${label}">
      <div class="month-header" data-month="${m}" role="button" tabindex="0" aria-expanded="${!collapsed}" aria-label="${label}，${days.length}天记录">
        <span class="arrow ${collapsed ? 'collapsed' : ''}" aria-hidden="true">▼</span>
        ${label}
        <span class="count">${days.length} 天</span>
      </div>
      <div class="month-body ${collapsed ? 'hidden' : ''}" role="list">
        ${days.map(d => {
          const page = diaryData[d];
          const preview = (page.text || '').replace(/\n/g,' ').slice(0, 50);
          const isToday = d === todayStr();
          const isActive = d === currentDate;
          const hasStudy = page.study && Object.values(page.study).reduce((a,b)=>a+b,0) > 0;
          return `<div class="entry-item ${isActive?'active':''}" data-date="${d}" role="listitem" tabindex="0"
            aria-label="${formatDateLabel(d)}${isToday ? '，今天' : ''}${preview || (hasStudy ? '学习了' : '空')}"
            ${isActive ? 'aria-current="date"' : ''}>
            <span class="date">${formatDateLabel(d)}</span>
            <span class="preview">${preview || (hasStudy ? '📚 学习了' : '📝 空')}</span>
            ${isToday ? '<span class="badge-today">今天</span>' : ''}
            <button class="entry-del" data-date="${d}" aria-label="删除${formatDateLabel(d)}的日记">✕</button>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  });
  entryList.innerHTML = html;
  dirty.entryList = false;
}

function saveMonthState() {
  try { localStorage.setItem('ky_month_collapsed', JSON.stringify(monthCollapsed)); } catch {}
}
function loadMonthState() {
  try {
    const d = localStorage.getItem('ky_month_collapsed');
    if (d) monthCollapsed = JSON.parse(d);
  } catch {}
}
loadMonthState();

// ============================================================
//  Subject Timer
// ============================================================
function ensurePage(dateStr) {
  if (!diaryData[dateStr]) diaryData[dateStr] = { text: '', study: {}, mood: '' };
  if (!diaryData[dateStr].study) diaryData[dateStr].study = {};
}

function getStudyData(dateStr) {
  ensurePage(dateStr);
  return diaryData[dateStr].study;
}

function renderSubjectGrid() {
  if (!dirty.subjects) return;
  const study = getStudyData(currentDate);
  const isToday = currentDate === todayStr();
  let html = '';
  state.subjects.forEach(s => {
    const sec = study[s.key] || 0;
    const isTracking = isToday && activeTracking === s.key;
    const c = s.color || 'var(--accent)';
    const ariaLabel = isToday
      ? (isTracking ? `暂停学习${s.name}` : `开始学习${s.name}`)
      : `${s.name}，今日学习${formatStudyTime(sec)}`;
    html += `<div class="subject-card ${isTracking ? 'active' : ''}" data-key="${s.key}"
      style="border-left:3px solid ${c};${isTracking?'background:'+c+'15;':''}"
      role="button" tabindex="0"
      aria-label="${ariaLabel}">
      <span class="emoji" aria-hidden="true">${s.emoji}</span>
      <span class="name">${s.name}</span>
      <span class="duration" id="studyDur_${s.key}" aria-live="polite">${formatStudyTime(sec)}</span>
      <span class="duration-label">今日学习</span>
      ${isToday ? `<button class="timer-toggle ${isTracking ? 'running' : ''}" data-key="${s.key}" tabindex="-1" aria-hidden="true">
        ${isTracking ? '⏸ 暂停' : '▶ 计时'}
      </button>` : ''}
    </div>`;
  });
  subjectGrid.innerHTML = html;
  dirty.subjects = false;
}

function formatStudyTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}:${String(m).padStart(2,'0')}` : `${m}:${String(Math.floor(sec % 60)).padStart(2,'0')}`;
}

function updateSubjectDurations() {
  const study = getStudyData(currentDate);
  state.subjects.forEach(s => {
    const el = document.getElementById('studyDur_' + s.key);
    if (el) {
      let sec = study[s.key] || 0;
      if (currentDate === todayStr() && activeTracking === s.key && trackingStart) {
        sec += Math.floor((Date.now() - trackingStart) / 1000);
      }
      el.textContent = formatStudyTime(sec);
    }
  });
}

function timeStr(d) {
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function ensureSessions(dateStr) {
  if (!diaryData[dateStr].sessions) diaryData[dateStr].sessions = [];
}

function toggleSubjectTimer(key) {
  if (currentDate !== todayStr()) {
    notify('只能记录今天的学习时间');
    return;
  }
  ensurePage(todayStr());
  ensureSessions(todayStr());

  const sub = state.subjects.find(s => s.key === key);
  const now = new Date();

  if (activeTracking === key) {
    // Stop tracking
    if (trackingStart) {
      const elapsed = Math.floor((now - trackingStart) / 1000);
      diaryData[todayStr()].study[key] = (diaryData[todayStr()].study[key] || 0) + elapsed;
      const sessions = diaryData[todayStr()].sessions;
      const last = sessions[sessions.length - 1];
      if (last && last.key === key && !last.end) {
        last.end = timeStr(now);
        last.duration = Math.round(elapsed / 60);
      }
    }
    clearInterval(trackingTick);
    trackingTick = null;
    activeTracking = null;
    trackingStart = null;
    _lastActiveKey = null;
    markAllDirty();
    renderSubjectGrid();
    renderMiniSubjects();
    renderGoals();
    renderTimeline();
    checkAchievements();
    save();
    return;
  }

  // Stop current tracking
  if (activeTracking) {
    if (trackingStart) {
      const prevElapsed = Math.floor((now - trackingStart) / 1000);
      diaryData[todayStr()].study[activeTracking] = (diaryData[todayStr()].study[activeTracking] || 0) + prevElapsed;
      const sessions = diaryData[todayStr()].sessions;
      const last = sessions[sessions.length - 1];
      if (last && last.key === activeTracking && !last.end) {
        last.end = timeStr(now);
        last.duration = Math.round(prevElapsed / 60);
      }
    }
    clearInterval(trackingTick);
  }

  // Start new session
  activeTracking = key;
  trackingStart = now;
  _lastActiveKey = key;
  diaryData[todayStr()].sessions.push({
    key: key,
    name: sub ? sub.name : key,
    emoji: sub ? sub.emoji : '📚',
    start: timeStr(now),
    end: '',
    duration: 0,
  });
  trackingTick = setInterval(() => {
    // 8.5: Only do lightweight text updates every second
    updateSubjectDurations();
    renderMiniSubjects();        // Light update when possible
    renderTimelineTick();        // Light timeline update
  }, 1000);
  markAllDirty();
  renderSubjectGrid();
  renderGoals();
  renderTimeline();
  save();
  notify(`📚 开始学习 ${sub ? sub.name : key}`);
}

// ============================================================
//  Diary
// ============================================================
function loadDiary(dateStr) {
  // Stop timer when leaving today
  if (currentDate === todayStr() && dateStr !== todayStr()) {
    if (activeTracking && trackingStart) {
      const elapsed = Math.floor((Date.now() - trackingStart) / 1000);
      diaryData[todayStr()].study[activeTracking] = (diaryData[todayStr()].study[activeTracking] || 0) + elapsed;
      const sessions = diaryData[todayStr()]?.sessions;
      if (sessions) {
        const last = sessions[sessions.length - 1];
        if (last && last.key === activeTracking && !last.end) {
          last.end = timeStr(new Date());
          last.duration = Math.round(elapsed / 60);
        }
      }
    }
    clearInterval(trackingTick);
    trackingTick = null;
    activeTracking = null;
    trackingStart = null;
    _lastActiveKey = null;
  }
  if (currentDate) saveDiaryPage(true);

  currentDate = dateStr;
  if (!diaryData[dateStr]) diaryData[dateStr] = { text: '', study: {}, mood: '' };

  const page = diaryData[dateStr];
  diaryText.value = page.text || '';

  const allDates = Object.keys(diaryData).sort();
  const firstDate = allDates.length > 0 ? allDates[0] : dateStr;
  const dayNum = Math.max(1, daysBetween(firstDate, dateStr) + 1);
  diaryDate.textContent = formatDateLabel(dateStr);
  diaryWeekday.textContent = `${getWeekday(dateStr)} · 备考第 ${dayNum} 天`;

  wordCount.textContent = (page.text || '').replace(/\s/g, '').length + ' 字';
  diarySaveStatus.classList.remove('show');

  // Daily quote
  const qIdx = Math.abs(hashCode(dateStr)) % QUOTES.length;
  quoteBar.textContent = QUOTES[qIdx];

  // Full render on date switch
  markAllDirty();
  _lastSessionCount = -1;
  renderSubjectGrid();
  renderMiniSubjects();
  renderEntryList();
  updateSubjectDurations();
  renderGoals();
  renderTimeline();
  renderTodos();
}

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

function saveDiaryPage(silent = false) {
  if (!currentDate) return;
  if (!diaryData[currentDate]) diaryData[currentDate] = { text: '', study: {}, mood: '' };
  diaryData[currentDate].text = diaryText.value;

  if (currentDate === todayStr() && activeTracking && trackingStart) {
    const elapsed = Math.floor((Date.now() - trackingStart) / 1000);
    diaryData[todayStr()].study[activeTracking] = (diaryData[todayStr()].study[activeTracking] || 0) + elapsed;
    trackingStart = Date.now();
  }

  save();
  if (!silent) {
    diarySaveStatus.classList.add('show');
    setTimeout(() => diarySaveStatus.classList.remove('show'), 2000);
  }
  dirty.entryList = true;
  dirty.miniSubjects = true;
  dirty.charts = true;
  renderEntryList();
  renderMiniSubjects();
  renderGoals();
}

// ============================================================
//  Goals
// ============================================================
function renderGoals() {
  if (!dirty.goals) return;
  goalSchool.value = state.goalSchool || '';
  goalMajor.value = state.goalMajor || '';
  autoWidth(goalSchool);
  autoWidth(goalMajor);

  let html = '';
  state.subjects.forEach(s => {
    const score = state.goalScores[s.key] || '';
    const maxScore = s.maxScore || 100;
    const c = s.color || 'var(--accent)';
    html += `<span class="hg-subject" data-key="${s.key}" style="border-color:${c};background:${c}11;">
      ${s.emoji}
      <input type="number" class="hg-score-input" data-key="${s.key}" value="${score}" min="0" max="${maxScore}" placeholder="—" aria-label="${s.name}目标分，满分${maxScore}">
      <span class="max">/${maxScore}</span>
    </span>`;
  });
  headerGoalSubjects.innerHTML = html;

  headerGoalSubjects.querySelectorAll('.hg-score-input').forEach(inp => {
    inp.addEventListener('change', () => {
      const key = inp.dataset.key;
      const val = inp.value.trim();
      state.goalScores[key] = val ? parseInt(val) : '';
      save();
      updateTotalScore();
    });
  });
  updateTotalScore();
  dirty.goals = false;
}

function updateTotalScore() {
  let total = 0;
  state.subjects.forEach(s => {
    const score = state.goalScores[s.key];
    if (score) total += parseInt(score);
  });
  document.getElementById('goalTotalScore').textContent = total || '0';
}

// ============================================================
//  Timeline — with 8.5 lightweight tick updates
// ============================================================
function renderTimelineFull() {
  const dateStr = currentDate || todayStr();
  const study = getStudyData(dateStr);
  let todaySec = study ? Object.values(study).reduce((a, b) => a + b, 0) : 0;
  if (dateStr === todayStr() && activeTracking && trackingStart) {
    todaySec += Math.floor((Date.now() - trackingStart) / 1000);
  }
  const todayMin = Math.round(todaySec / 60);
  sideDailyProgress.textContent = `${todayMin} 分钟`;

  // Total progress (uses cached totals)
  const { totalSec, studyDays } = getTotals();
  const totalHours = (totalSec / 3600);
  const targetHours = state.totalTargetHours || 500;
  const totalPct = Math.min(100, Math.round((totalHours / targetHours) * 100));
  sideTotalProgress.textContent = `${totalHours.toFixed(1)} 小时`;
  sideTotalBar.style.width = totalPct + '%';
  sideTotalBar.classList.toggle('good', totalPct >= 100);
  sideTotalDays.textContent = `已学习 ${studyDays} 天`;
  sideTotalPercent.textContent = totalPct + '%';
  // Update progress bar ARIA
  const progBar = sideTotalBar.parentElement;
  if (progBar) {
    progBar.setAttribute('aria-valuenow', totalPct);
    progBar.setAttribute('aria-valuetext', `${totalHours.toFixed(1)}小时 / ${targetHours}小时`);
  }

  // Timeline sessions
  const sessions = diaryData[dateStr]?.sessions;
  const isToday = dateStr === todayStr();
  if (!sessions || !sessions.length) {
    timelineList.innerHTML = `<div style="color:var(--ink-lighter);font-style:italic;text-align:center;padding:12px 0;">${isToday ? '还没有学习记录' : '当天无学习记录'}</div>`;
    _lastSessionCount = 0;
    dirty.timeline = false;
    return;
  }
  const display = isToday ? sessions.filter(s => s.end || s.key === activeTracking) : sessions.filter(s => s.end);
  _lastSessionCount = display.length;
  timelineList.innerHTML = display.map((s, idx) => {
    const end = s.end || 'now';
    const dur = s.duration > 0 ? `${s.duration}分` : '';
    const sub = state.subjects.find(su => su.key === s.key);
    const c = sub ? sub.color : 'var(--accent)';
    const isActive = isToday && s.key === activeTracking && !s.end;
    return `<div class="tl-item" data-tl-idx="${idx}" ${isActive ? 'data-tl-active="true"' : ''}>
      <span class="tl-time" data-tl-time="${idx}">${s.start}–${end}</span>
      <span class="tl-subject"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${c};margin-right:4px;"></span>${s.name}</span>
      <span class="tl-duration" data-tl-dur="${idx}">${dur}</span>
    </div>`;
  }).join('');
  timelineList.scrollTop = timelineList.scrollHeight;
  dirty.timeline = false;
}

// Lightweight tick: only update active session time/duration
function renderTimelineTick() {
  const dateStr = currentDate || todayStr();
  if (dateStr !== todayStr() || !activeTracking) return;

  // Update daily minutes text
  const study = getStudyData(dateStr);
  let todaySec = study ? Object.values(study).reduce((a, b) => a + b, 0) : 0;
  if (trackingStart) {
    todaySec += Math.floor((Date.now() - trackingStart) / 1000);
  }
  sideDailyProgress.textContent = `${Math.round(todaySec / 60)} 分钟`;

  // Update total progress (uses cached totals)
  const { totalSec } = getTotals();
  const totalHours = totalSec / 3600;
  const totalPct = Math.min(100, Math.round((totalHours / (state.totalTargetHours || 500)) * 100));
  sideTotalProgress.textContent = `${totalHours.toFixed(1)} 小时`;
  sideTotalBar.style.width = totalPct + '%';

  // Only update the active timeline item's end time and duration
  const activeItem = timelineList.querySelector('[data-tl-active="true"]');
  if (activeItem) {
    const now = new Date();
    const elapsed = Math.floor((Date.now() - trackingStart) / 1000);
    const timeEl = activeItem.querySelector('[data-tl-time]');
    const durEl = activeItem.querySelector('[data-tl-dur]');
    if (timeEl) {
      const startPart = timeEl.textContent.split('–')[0];
      timeEl.textContent = `${startPart}–${timeStr(now)}`;
    }
    if (durEl) {
      durEl.textContent = `${Math.round(elapsed / 60)}分`;
    }
  } else {
    // Session list changed — need full rebuild
    dirty.timeline = true;
    renderTimelineFull();
  }
}

function renderTimeline() {
  if (dirty.timeline) {
    renderTimelineFull();
  } else {
    renderTimelineTick();
  }
}

// ============================================================
//  Todo
// ============================================================
function renderTodos() {
  // General tasks — 从创建日期起至删除日期前累积显示
  const eligible = state.todos.filter(t => t.createdAt <= currentDate && (!t.deletedAt || t.deletedAt > currentDate));
  const doneTasks = diaryData[currentDate]?.doneTasks || {};

  if (!eligible.length) {
    todoGeneralList.innerHTML = '<li class="todo-empty">还没有通用任务 ✨</li>';
  } else {
    todoGeneralList.innerHTML = eligible.map(t => {
      const isDone = doneTasks[t.id] || false;
      return `<li class="todo-item" data-task-id="${t.id}">
        <button class="todo-check ${isDone ? 'done' : ''}" data-task-id="${t.id}" role="checkbox" aria-checked="${isDone}" aria-label="${isDone ? '取消完成' : '标记完成'}：${esc(t.text)}"></button>
        <span class="todo-text ${isDone ? 'done' : ''}">${esc(t.text)}</span>
        <button class="todo-del" data-task-id="${t.id}" aria-label="删除任务：${esc(t.text)}">✕</button>
      </li>`;
    }).join('');
    const items = [...todoGeneralList.querySelectorAll('.todo-item')];
    items.sort((a, b) => (a.querySelector('.todo-check').classList.contains('done')?1:0) - (b.querySelector('.todo-check').classList.contains('done')?1:0));
    items.forEach(el => todoGeneralList.appendChild(el));
  }

  // Daily tasks
  const dailyTodos = diaryData[currentDate]?.todos || [];
  if (!dailyTodos.length) {
    todoDailyList.innerHTML = '<li class="todo-empty">还没有当天任务 ✨</li>';
  } else {
    todoDailyList.innerHTML = dailyTodos.map((t, i) =>
      `<li class="todo-item" data-index="${i}">
        <button class="todo-check ${t.done ? 'done' : ''}" data-index="${i}" role="checkbox" aria-checked="${t.done}" aria-label="${t.done ? '取消完成' : '标记完成'}：${esc(t.text)}"></button>
        <span class="todo-text ${t.done ? 'done' : ''}">${esc(t.text)}</span>
        <button class="todo-del" data-index="${i}" aria-label="删除任务：${esc(t.text)}">✕</button>
      </li>`
    ).join('');
    const items = [...todoDailyList.querySelectorAll('.todo-item')];
    items.sort((a, b) => (a.querySelector('.todo-check').classList.contains('done')?1:0) - (b.querySelector('.todo-check').classList.contains('done')?1:0));
    items.forEach(el => todoDailyList.appendChild(el));
  }
}

function notify(msg) {
  notificationEl.textContent = msg;
  notificationEl.classList.add('show');
  clearTimeout(window._notifTimer);
  window._notifTimer = setTimeout(() => notificationEl.classList.remove('show'), 3000);
}

// ============================================================
//  8.7: Keyboard navigation for diary entry list
// ============================================================
entryList.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const items = [...entryList.querySelectorAll('.entry-item')];
    if (!items.length) return;
    const currentIdx = items.findIndex(el => el === document.activeElement);
    let nextIdx;
    if (e.key === 'ArrowDown') {
      nextIdx = currentIdx < 0 ? 0 : Math.min(currentIdx + 1, items.length - 1);
    } else {
      nextIdx = currentIdx < 0 ? items.length - 1 : Math.max(currentIdx - 1, 0);
    }
    items[nextIdx].focus();
  }
  if (e.key === 'Enter' || e.key === ' ') {
    const item = document.activeElement?.closest('.entry-item');
    if (item) {
      e.preventDefault();
      loadDiary(item.dataset.date);
    }
  }
});

// Month header keyboard support
entryList.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && document.activeElement?.closest('.month-header')) {
    e.preventDefault();
    document.activeElement.click();
  }
});

// ============================================================
//  8.7: Keyboard support for subject cards
// ============================================================
subjectGrid.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    const card = document.activeElement?.closest('.subject-card');
    if (card) {
      e.preventDefault();
      toggleSubjectTimer(card.dataset.key);
    }
  }
});

// ============================================================
//  Events
// ============================================================

// Diary nav
function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
navPrev.addEventListener('click', () => {
  const d = new Date(currentDate + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  loadDiary(ymd(d));
});
navToday.addEventListener('click', () => loadDiary(todayStr()));
navNext.addEventListener('click', () => {
  const d = new Date(currentDate + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  loadDiary(ymd(d));
});

// Diary save
diarySaveBtn.addEventListener('click', () => saveDiaryPage());
diaryText.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); saveDiaryPage(); }
});
diaryText.addEventListener('input', () => {
  wordCount.textContent = diaryText.value.replace(/\s/g, '').length + ' 字';
});
diaryText.addEventListener('blur', () => saveDiaryPage(true));

// Entry list click
entryList.addEventListener('click', e => {
  const header = e.target.closest('.month-header');
  if (header) {
    const m = header.dataset.month;
    if (m) {
      monthCollapsed[m] = !monthCollapsed[m];
      saveMonthState();
      dirty.entryList = true;
      renderEntryList();
      const active = entryList.querySelector(`.entry-item.active`);
      if (active) active.scrollIntoView({ block: 'nearest' });
    }
    return;
  }
  const del = e.target.closest('.entry-del');
  if (del) {
    e.stopPropagation();
    const d = del.dataset.date;
    delete diaryData[d];
    if (currentDate === d) {
      currentDate = '';
      diaryText.value = '';
      loadDiary(todayStr());
    }
    save();
    dirty.entryList = true;
    renderEntryList();
    notify(`已删除 ${formatDateLabel(d)} 的日记`);
    return;
  }
  const item = e.target.closest('.entry-item');
  if (item) loadDiary(item.dataset.date);
});

// Subject grid clicks
subjectGrid.addEventListener('click', e => {
  const btn = e.target.closest('.timer-toggle');
  if (btn) { toggleSubjectTimer(btn.dataset.key); return; }
  const card = e.target.closest('.subject-card');
  if (card) toggleSubjectTimer(card.dataset.key);
});

function autoWidth(el) {
  const span = document.createElement('span');
  span.style.cssText = 'visibility:hidden;position:absolute;white-space:nowrap;font-size:' + getComputedStyle(el).fontSize + ';font-family:' + getComputedStyle(el).fontFamily + ';padding:0';
  span.textContent = el.value || el.placeholder;
  document.body.appendChild(span);
  const w = span.offsetWidth + 28;
  document.body.removeChild(span);
  el.style.width = Math.max(60, Math.min(220, w)) + 'px';
}
document.addEventListener('input', e => {
  if (e.target.classList.contains('auto-width')) autoWidth(e.target);
});

// Goals
goalSchool.addEventListener('change', () => {
  state.goalSchool = goalSchool.value.trim();
  save();
});
goalMajor.addEventListener('change', () => {
  state.goalMajor = goalMajor.value.trim();
  save();
});

// Search
let searchTimer;
entrySearch.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    dirty.entryList = true;
    renderEntryList();
  }, 200);
});

// ============================================================
//  8.8: Data Visualization — Bar charts
// ============================================================

function renderBarChart() {
  if (!chartBarWeek) return;
  const section = document.getElementById('vizBarSection');

  const now = new Date();
  const dow = now.getDay() || 7;
  const mon = new Date(now); mon.setDate(now.getDate() - dow + 1);
  const todayKey = todayStr();

  const days = [];
  let maxMin = 0;
  for (let i = 0; i < 7; i++) {
    const day = new Date(mon); day.setDate(mon.getDate() + i);
    const ds = day.toISOString().slice(0,10);
    const study = diaryData[ds]?.study;
    let sec = study ? Object.values(study).reduce((a,b)=>a+b,0) : 0;
    // Add active tracking if this day is today
    if (ds === todayKey && activeTracking && trackingStart) {
      sec += Math.floor((Date.now() - trackingStart) / 1000);
    }
    const min = Math.round(sec / 60);
    days.push({ date: ds, min, label: ['一','二','三','四','五','六','日'][i] });
    if (min > maxMin) maxMin = min;
  }

  if (section) section.style.display = '';

  if (maxMin === 0) {
    chartBarWeek.innerHTML = '<div class="viz-empty">本周还没有学习记录</div>';
    return;
  }

  let html = '<div class="bar-chart">';
  days.forEach(d => {
    const pct = Math.max(3, Math.round((d.min / Math.max(maxMin, 1)) * 100));
    const isToday = d.date === todayKey;
    html += `<div class="bar-col${isToday ? ' today' : ''}">
      <div class="bar-value">${d.min > 0 ? d.min + '分' : ''}</div>
      <div class="bar-fill" style="height:${pct}%;" title="${d.label}期: ${d.min}分钟"></div>
      <div class="bar-label">${d.label}</div>
    </div>`;
  });
  html += '</div>';
  chartBarWeek.innerHTML = html;
}

function renderSubjectDist() {
  if (!chartSubjectDist) return;
  const section = document.getElementById('vizDistSection');

  const todayPage = diaryData[todayStr()] || { study: {} };
  const study = todayPage.study || {};
  const segments = [];
  let total = 0;

  state.subjects.forEach(s => {
    let sec = study[s.key] || 0;
    if (activeTracking === s.key && trackingStart) {
      sec += Math.floor((Date.now() - trackingStart) / 1000);
    }
    if (sec > 0) {
      segments.push({ name: s.name, emoji: s.emoji, sec, color: s.color });
      total += sec;
    }
  });

  if (section) section.style.display = '';

  if (segments.length === 0) {
    chartSubjectDist.innerHTML = '<div class="viz-empty">今天还没有学习</div>';
    return;
  }

  let html = '<div class="stacked-bar-wrap"><div class="stacked-bar">';
  segments.forEach(seg => {
    const pct = Math.round((seg.sec / total) * 100);
    html += `<div class="stacked-segment" style="width:${pct}%;background:${seg.color};" title="${seg.name}: ${hms(seg.sec)} (${pct}%)"></div>`;
  });
  html += '</div></div>';

  // Legend
  html += '<div class="viz-legend">';
  segments.forEach(seg => {
    const pct = Math.round((seg.sec / total) * 100);
    html += `<div class="viz-legend-item">
      <span class="viz-legend-dot" style="background:${seg.color};"></span>
      ${seg.emoji} ${seg.name} ${hms(seg.sec)} (${pct}%)
    </div>`;
  });
  html += '</div>';

  chartSubjectDist.innerHTML = html;
}

function hideCharts() {
  const barSection = document.getElementById('vizBarSection');
  const distSection = document.getElementById('vizDistSection');
  if (barSection) barSection.style.display = 'none';
  if (distSection) distSection.style.display = 'none';
}

function renderCharts() {
  renderBarChart();
  renderSubjectDist();
}

// ============================================================
//  Export
// ============================================================
function exportData(format) {
  const all = {};
  const dates = Object.keys(diaryData).sort();
  dates.forEach(d => {
    const p = diaryData[d];
    all[d] = {};
    if (p.text) all[d].text = p.text;
    if (p.study && Object.values(p.study).reduce((a,b)=>a+b,0) > 0) all[d].study = p.study;
    if (p.sessions && p.sessions.length) all[d].sessions = p.sessions;
  });

  let content, filename, type;
  if (format === 'json') {
    content = JSON.stringify({ state, diary: all }, null, 2);
    filename = `kaoyan_backup_${todayStr()}.json`;
    type = 'application/json';
  } else {
    content = '📚 考研日记导出\n' + '='.repeat(40) + '\n';
    content += `目标院校: ${state.goalSchool||'—'} · ${state.goalMajor||'—'}\n`;
    state.subjects.forEach(s => {
      const sc = state.goalScores[s.key] || '—';
      content += `${s.emoji} ${s.name}: ${sc}/${s.maxScore}\n`;
    });
    content += `\n${'='.repeat(40)}\n\n`;
    dates.forEach(d => {
      const p = diaryData[d];
      if (!p.text && (!p.study || !Object.values(p.study).reduce((a,b)=>a+b,0))) return;
      const total = p.study ? Object.values(p.study).reduce((a,b)=>a+b,0) : 0;
      content += `📅 ${d} ${getWeekday(d)}\n`;
      content += `${'-'.repeat(30)}\n`;
      if (p.text) content += `${p.text}\n\n`;
      if (total > 0) {
        content += '学习:\n';
        state.subjects.forEach(s => {
          const sec = (p.study||{})[s.key] || 0;
          if (sec > 0) content += `  ${s.emoji} ${s.name}: ${hms(sec)}\n`;
        });
        content += `  总计: ${hms(total)}\n`;
      }
      content += `\n`;
    });
    filename = `kaoyan_diary_${todayStr()}.txt`;
    type = 'text/plain';
  }
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  notify(`已导出 ${filename}`);
}
exportJSON.addEventListener('click', () => exportData('json'));
exportTXT.addEventListener('click', () => exportData('txt'));

// ============================================================
//  Weekly report (includes charts from 8.8)
// ============================================================
let showWeekly = false;
function renderWeeklyReport() {
  if (!showWeekly) {
    weeklyReport.style.display = 'none';
    weeklyToggle.classList.remove('active');
    weeklyToggle.textContent = '📅 本周统计';
    weeklyToggle.setAttribute('aria-expanded', 'false');
    hideCharts();
    return;
  }
  weeklyToggle.classList.add('active');
  weeklyToggle.textContent = '📅 收起';
  weeklyToggle.setAttribute('aria-expanded', 'true');

  const now = new Date();
  const dow = now.getDay() || 7;
  const mon = new Date(now); mon.setDate(now.getDate() - dow + 1);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const start = mon.toISOString().slice(0,10);
  const end = sun.toISOString().slice(0,10);

  const dates = Object.keys(diaryData).filter(d => d >= start && d <= end).sort();
  let weekly = { total: 0 };
  state.subjects.forEach(s => { weekly[s.key] = 0; });

  let daysStudied = 0;
  dates.forEach(d => {
    const study = diaryData[d]?.study;
    if (!study) return;
    const dayTotal = Object.values(study).reduce((a,b)=>a+b,0);
    if (dayTotal > 0) daysStudied++;
    state.subjects.forEach(s => {
      weekly[s.key] += study[s.key] || 0;
      weekly.total += study[s.key] || 0;
    });
  });

  weekly.total = Object.values(weekly).reduce((a,b) => typeof b === 'number' ? a+b : a, 0);
  let html = `<div style="font-size:11px;color:var(--ink-light);margin-bottom:4px;font-family:-apple-system,sans-serif;">${start.slice(5)} ~ ${end.slice(5)} · 学习 ${daysStudied}/${dates.length||7} 天</div>`;
  html += '<table class="weekly-table"><tr><th></th><th>周一</th><th>周二</th><th>周三</th><th>周四</th><th>周五</th><th>周六</th><th>周日</th><th>合计</th></tr>';

  state.subjects.forEach(s => {
    html += `<tr><td class="wt-subject">${s.emoji}</td>`;
    let subTotal = 0;
    for (let i = 0; i < 7; i++) {
      const day = new Date(mon); day.setDate(mon.getDate() + i);
      const ds = day.toISOString().slice(0,10);
      const sec = (diaryData[ds]?.study||{})[s.key] || 0;
      subTotal += sec;
      html += `<td>${sec > 0 ? hms(sec) : '—'}</td>`;
    }
    html += `<td style="font-weight:600;">${subTotal > 0 ? hms(subTotal) : '—'}</td></tr>`;
  });

  html += `<tr class="wt-total"><td style="font-weight:600;">合计</td>`;
  for (let i = 0; i < 7; i++) {
    const day = new Date(mon); day.setDate(mon.getDate() + i);
    const ds = day.toISOString().slice(0,10);
    const total = diaryData[ds]?.study ? Object.values(diaryData[ds].study).reduce((a,b)=>a+b,0) : 0;
    html += `<td>${total > 0 ? hms(total) : '—'}</td>`;
  }
  html += `<td style="font-weight:600;">${hms(weekly.total)}</td></tr></table>`;

  weeklyReport.innerHTML = html;
  weeklyReport.style.display = '';

  // Render charts
  renderCharts();
}

weeklyToggle.addEventListener('click', () => {
  showWeekly = !showWeekly;
  renderWeeklyReport();
});

// ============================================================
//  8.6: Cleanup button handler
// ============================================================
if (cleanupBtn) {
  cleanupBtn.addEventListener('click', manualCleanup);
}

// Todo — 通用任务（累积：创建后出现在该天及之后所有日期）
addGeneralBtn.addEventListener('click', () => {
  const text = todoGeneralInput.value.trim();
  if (!text) return;
  const task = { id: state.nextTaskId++, text, createdAt: currentDate, deletedAt: null };
  state.todos.push(task);
  todoGeneralInput.value = '';
  renderTodos(); save();
});
todoGeneralInput.addEventListener('keydown', e => { if (e.key === 'Enter') addGeneralBtn.click(); });
todoGeneralList.addEventListener('click', e => {
  const ck = e.target.closest('.todo-check');
  if (ck) {
    const taskId = parseInt(ck.dataset.taskId);
    if (!isNaN(taskId)) {
      ensurePage(currentDate);
      if (!diaryData[currentDate].doneTasks) diaryData[currentDate].doneTasks = {};
      diaryData[currentDate].doneTasks[taskId] = !diaryData[currentDate].doneTasks[taskId];
      renderTodos(); save();
    }
    return;
  }
  const dl = e.target.closest('.todo-del');
  if (dl) {
    const taskId = parseInt(dl.dataset.taskId);
    if (!isNaN(taskId)) {
      const task = state.todos.find(t => t.id === taskId);
      if (task) task.deletedAt = currentDate; // 过去已定型，只影响当前及以后
      renderTodos(); save();
    }
  }
});

// Todo — 当天任务
addDailyBtn.addEventListener('click', () => {
  const text = todoDailyInput.value.trim();
  if (!text) return;
  ensurePage(currentDate);
  if (!diaryData[currentDate].todos) diaryData[currentDate].todos = [];
  diaryData[currentDate].todos.push({ text, done: false });
  todoDailyInput.value = '';
  renderTodos(); save();
});
todoDailyInput.addEventListener('keydown', e => { if (e.key === 'Enter') addDailyBtn.click(); });
todoDailyList.addEventListener('click', e => {
  const dailyTodos = diaryData[currentDate]?.todos;
  if (!dailyTodos) return;
  const ck = e.target.closest('.todo-check');
  if (ck) {
    const i = parseInt(ck.dataset.index);
    if (i >= 0 && i < dailyTodos.length) {
      dailyTodos[i].done = !dailyTodos[i].done;
      renderTodos(); save();
    }
    return;
  }
  const dl = e.target.closest('.todo-del');
  if (dl) {
    const i = parseInt(dl.dataset.index);
    if (i >= 0 && i < dailyTodos.length) {
      dailyTodos.splice(i, 1);
      renderTodos(); save();
    }
  }
});

// ============================================================
//  Init
// ============================================================
initTheme();
load();
updateCountdown();
updateClock();
updateStorageInfo();

// Daily reset
if (state.date !== todayStr()) {
  state.date = todayStr();
}

renderTodos();
renderGoals();
renderTimeline();

// Load today
loadDiary(todayStr());
save();

// 尝试从本地 data.json 读取数据（服务器模式）
initServerSync();


// ---- 8.5: Optimized clock tick with rAF batching ----
setInterval(() => {
  const oldDate = state.date;
  updateClock();
  const now = todayStr();
  if (oldDate !== now) {
    // Day change — full reset
    state.date = now;
    if (activeTracking && trackingStart) {
      const elapsed = Math.floor((Date.now() - trackingStart) / 1000);
      diaryData[oldDate].study[activeTracking] = (diaryData[oldDate].study[activeTracking] || 0) + elapsed;
      const sessions = diaryData[oldDate]?.sessions;
      if (sessions) {
        const last = sessions[sessions.length - 1];
        if (last && last.key === activeTracking && !last.end) {
          last.end = timeStr(new Date());
          last.duration = Math.round(elapsed / 60);
        }
      }
    }
    clearInterval(trackingTick);
    trackingTick = null;
    activeTracking = null;
    trackingStart = null;
    _lastActiveKey = null;
    _lastSessionCount = -1;
    if (!diaryData[now]) diaryData[now] = { text: '', study: {}, mood: '' };
    if (currentDate === oldDate || currentDate === now) {
      loadDiary(now);
    }
    markAllDirty();
    dirty.entryList = true;
    renderEntryList();
    save();
    updateStorageInfo();
  }
  // 8.5: Only do lightweight updates during active tracking
  if (activeTracking && trackingStart) {
    // These all use lightweight updates (textContent), no innerHTML
    updateSubjectDurations();
    renderMiniSubjects();
    renderTimeline();
  }
}, 1000);

// Update countdown every hour
setInterval(updateCountdown, 3600000);

// Check achievements on load (delayed)
setTimeout(checkAchievements, 500);

// Before unload, save diary
window.addEventListener('beforeunload', () => saveDiaryPage(true));

// 8.7: Update ARIA labels on subject cards when timer state changes
// (done inline in renderSubjectGrid)
