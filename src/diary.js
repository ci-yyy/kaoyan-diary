// ============================================================
//  Diary — 日记编辑器、日记索引、搜索
// ============================================================

let monthCollapsed = {};

// ============================================================
//  Diary Entry List (sidebar)
// ============================================================
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
//  Diary Editor
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
