// ============================================================
//  Achievements — 成就系统
// ============================================================

let unlockedAchievements = {};

function checkAchievements() {
  const dates = Object.keys(diaryData).sort();
  let totalSec = 0, maxDay = 0;
  let streak = 0, bestStreak = 0;
  dates.forEach(d => {
    const p = diaryData[d];
    const ds = p.study ? Object.values(p.study).reduce((a,b)=>a+b,0) : 0;
    totalSec += ds;
    if (ds > maxDay) maxDay = ds;
    if (ds > 0) streak++;
    else { if (streak > bestStreak) bestStreak = streak; streak = 0; }
  });
  if (streak > bestStreak) bestStreak = streak;

  const totalHours = totalSec / 3600;
  const diaryCount = dates.filter(d => diaryData[d]?.text?.trim()).length;

  const checks = {
    streak3: bestStreak >= 3, streak7: bestStreak >= 7,
    streak14: bestStreak >= 14, streak30: bestStreak >= 30,
    hours50: totalHours >= 50, hours100: totalHours >= 100,
    hours300: totalHours >= 300, hours500: totalHours >= 500,
    day8h: maxDay >= 28800, day10h: maxDay >= 36000,
    diary10: diaryCount >= 10, diary50: diaryCount >= 50,
  };

  let unlocked = [];
  Object.entries(checks).forEach(([id, ok]) => {
    if (ok && !unlockedAchievements[id]) {
      unlockedAchievements[id] = true;
      unlocked.push(id);
    }
  });
  if (unlocked.length) {
    try { localStorage.setItem('ky_achievements', JSON.stringify(unlockedAchievements)); } catch {}
    unlocked.forEach(id => {
      const a = ACHIEVEMENTS.find(ac => ac.id === id);
      if (a) showAchievement(a);
    });
  }
}

function showAchievement(a) {
  const el = document.createElement('div');
  el.setAttribute('role', 'alert');
  el.setAttribute('aria-live', 'polite');
  const isDark = document.documentElement.classList.contains('dark');
  el.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-120px);z-index:300;background:'+(isDark?'#2a2a38':'#fffdf5')+';border:1px solid '+(isDark?'#444':'#e2d9c8')+';border-radius:14px;padding:14px 24px;box-shadow:0 8px 40px rgba(0,0,0,0.2);text-align:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif;transition:transform 0.5s cubic-bezier(.4,0,.2,1);pointer-events:none;';
  el.innerHTML = `<div style="font-size:32px;">${a.emoji}</div><div style="font-size:14px;font-weight:700;margin-top:4px;color:'+(isDark?'#ddd':'#2c2c2c')+';">🏅 ${a.title}</div><div style="font-size:12px;color:'+(isDark?'#999':'#8a8078')+';margin-top:2px;">${a.desc}</div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => {
    el.style.transform = 'translateX(-50%) translateY(-120px)';
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 600);
  }, 3000);
}
