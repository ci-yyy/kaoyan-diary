// ============================================================
//  Utils — 工具函数
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

function formatStudyTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}:${String(m).padStart(2,'0')}` : `${m}:${String(Math.floor(sec % 60)).padStart(2,'0')}`;
}

function timeStr(d) {
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

function autoWidth(el) {
  const span = document.createElement('span');
  span.style.cssText = 'visibility:hidden;position:absolute;white-space:nowrap;font-size:' + getComputedStyle(el).fontSize + ';font-family:' + getComputedStyle(el).fontFamily + ';padding:0';
  span.textContent = el.value || el.placeholder;
  document.body.appendChild(span);
  const w = span.offsetWidth + 28;
  document.body.removeChild(span);
  el.style.width = Math.max(60, Math.min(220, w)) + 'px';
}

function notify(msg) {
  notificationEl.textContent = msg;
  notificationEl.classList.add('show');
  clearTimeout(window._notifTimer);
  window._notifTimer = setTimeout(() => notificationEl.classList.remove('show'), 3000);
}
