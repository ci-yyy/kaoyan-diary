// ============================================================
//  Storage — 存储管理、服务器同步、Save/Load
//  8.6: QuotaExceededError 处理、30天自动截断
// ============================================================

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

  // 迁移：如果任务创建日的日记条目已被删除，同步标记任务为已删除
  // 防止删除日记后任务残留（先有日记条目才可能创建任务）
  state.todos.forEach(t => {
    if (t.deletedAt === null && t.createdAt && !diaryData[t.createdAt]) {
      t.deletedAt = t.createdAt;
    }
  });

  // Auto-cleanup old sessions on load
  truncateOldSessions();
}
