// ============================================================
//  Stats — 时间线、进度条、周报、图表
//  8.8: CSS 柱状图 + 堆叠条形图
// ============================================================

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
