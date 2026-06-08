// ============================================================
//  Theme — 深色/浅色主题切换
// ============================================================

function initTheme() {
  const dark = localStorage.getItem('ky_diary_theme') === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  themeToggle.textContent = dark ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-label', dark ? '切换到浅色主题' : '切换到深色主题');
}
