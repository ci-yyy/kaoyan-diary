// ============================================================
//  Clock — 实时时钟 + 考研倒计时
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

function updateCountdown() {
  const today = todayStr();
  const diff = daysBetween(today, EXAM_DATE);
  countdownNum.textContent = Math.max(0, diff);
  countdownWeeks.textContent = Math.max(0, Math.floor(diff / 7));
  countdownHours.textContent = Math.max(0, diff * 24);
  const ed = new Date(EXAM_DATE + 'T12:00:00');
  examDateDisplay.textContent = `📅 ${ed.getFullYear()}年${ed.getMonth()+1}月${ed.getDate()}日 · ${WEEKDAYS[ed.getDay()]}`;
}
