// ============================================================
//  Subjects — 科目计时器、迷你科目视图
//  8.5: 轻量/全量双轨渲染
// ============================================================

// ============================================================
//  Mini Subjects (侧边栏今日速览)
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
//  Subject Timer (主区域卡片)
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
