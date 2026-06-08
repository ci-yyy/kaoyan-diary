// ============================================================
//  Init — 初始化流程、全局定时器、页面关闭保存
// ============================================================

// ===================== 启动 =====================
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


// ===================== 全局定时器 =====================

// ---- 8.5: Optimized clock tick ----
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

// Before unload, save diary + immediately flush to server
window.addEventListener('beforeunload', () => {
  saveDiaryPage(true);
  // 使用 sendBeacon 确保页面关闭后请求仍能送达（即使页面正在关闭）
  try {
    const payload = {};
    ['ky_diary_state','ky_diary_pages','ky_achievements','ky_diary_theme','ky_month_collapsed'].forEach(k => {
      const v = localStorage.getItem(k);
      if (v) payload[k] = v;
    });
    // 使用 sendBeacon 确保页面关闭后请求仍能送达
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon('/api/save', blob);
  } catch {}
});
