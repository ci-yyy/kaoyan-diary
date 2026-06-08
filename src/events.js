// ============================================================
//  Events — 所有事件绑定
//  拆分为独立模块，保持交互行为不变
// ============================================================

// ============================================================
//  Theme toggle
// ============================================================
themeToggle.addEventListener('click', () => {
  const dark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('ky_diary_theme', dark ? 'dark' : 'light');
  themeToggle.textContent = dark ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-label', dark ? '切换到浅色主题' : '切换到深色主题');
});

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
//  Diary navigation
// ============================================================
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

// ============================================================
//  Diary save / editor
// ============================================================
diarySaveBtn.addEventListener('click', () => saveDiaryPage());
diaryText.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); saveDiaryPage(); }
});
diaryText.addEventListener('input', () => {
  wordCount.textContent = diaryText.value.replace(/\s/g, '').length + ' 字';
});
diaryText.addEventListener('blur', () => saveDiaryPage(true));

// ============================================================
//  Entry list click (month fold + delete + load)
// ============================================================
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
    // 同时标记创建于该天的通用任务为已删除，避免重新创建日期后残留
    state.todos.forEach(t => {
      if (t.createdAt === d && t.deletedAt === null) t.deletedAt = d;
    });
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

// ============================================================
//  Subject grid clicks
// ============================================================
subjectGrid.addEventListener('click', e => {
  const btn = e.target.closest('.timer-toggle');
  if (btn) { toggleSubjectTimer(btn.dataset.key); return; }
  const card = e.target.closest('.subject-card');
  if (card) toggleSubjectTimer(card.dataset.key);
});

// ============================================================
//  Auto-width for input fields
// ============================================================
document.addEventListener('input', e => {
  if (e.target.classList.contains('auto-width')) autoWidth(e.target);
});

// ============================================================
//  Goals
// ============================================================
goalSchool.addEventListener('change', () => {
  state.goalSchool = goalSchool.value.trim();
  save();
});
goalMajor.addEventListener('change', () => {
  state.goalMajor = goalMajor.value.trim();
  save();
});

// ============================================================
//  Search
// ============================================================
let searchTimer;
entrySearch.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    dirty.entryList = true;
    renderEntryList();
  }, 200);
});

// ============================================================
//  Export buttons
// ============================================================
exportJSON.addEventListener('click', () => exportData('json'));
exportTXT.addEventListener('click', () => exportData('txt'));

// ============================================================
//  Weekly toggle
// ============================================================
weeklyToggle.addEventListener('click', () => {
  showWeekly = !showWeekly;
  renderWeeklyReport();
});

// ============================================================
//  8.6: Cleanup button
// ============================================================
if (cleanupBtn) {
  cleanupBtn.addEventListener('click', manualCleanup);
}

// ============================================================
//  Todo — 通用任务（累积：创建后出现在该天及之后所有日期）
// ============================================================
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

// ============================================================
//  Todo — 当天任务
// ============================================================
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
