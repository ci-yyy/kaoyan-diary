// ============================================================
//  State — 全局状态、脏标记、rAF 批处理、缓存
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
