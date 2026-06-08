// ============================================================
//  Export — JSON / TXT 导出
// ============================================================

function exportData(format) {
  const all = {};
  const dates = Object.keys(diaryData).sort();
  dates.forEach(d => {
    const p = diaryData[d];
    all[d] = {};
    if (p.text) all[d].text = p.text;
    if (p.study && Object.values(p.study).reduce((a,b)=>a+b,0) > 0) all[d].study = p.study;
    if (p.sessions && p.sessions.length) all[d].sessions = p.sessions;
  });

  let content, filename, type;
  if (format === 'json') {
    content = JSON.stringify({ state, diary: all }, null, 2);
    filename = `kaoyan_backup_${todayStr()}.json`;
    type = 'application/json';
  } else {
    content = '📚 考研日记导出\n' + '='.repeat(40) + '\n';
    content += `目标院校: ${state.goalSchool||'—'} · ${state.goalMajor||'—'}\n`;
    state.subjects.forEach(s => {
      const sc = state.goalScores[s.key] || '—';
      content += `${s.emoji} ${s.name}: ${sc}/${s.maxScore}\n`;
    });
    content += `\n${'='.repeat(40)}\n\n`;
    dates.forEach(d => {
      const p = diaryData[d];
      if (!p.text && (!p.study || !Object.values(p.study).reduce((a,b)=>a+b,0))) return;
      const total = p.study ? Object.values(p.study).reduce((a,b)=>a+b,0) : 0;
      content += `📅 ${d} ${getWeekday(d)}\n`;
      content += `${'-'.repeat(30)}\n`;
      if (p.text) content += `${p.text}\n\n`;
      if (total > 0) {
        content += '学习:\n';
        state.subjects.forEach(s => {
          const sec = (p.study||{})[s.key] || 0;
          if (sec > 0) content += `  ${s.emoji} ${s.name}: ${hms(sec)}\n`;
        });
        content += `  总计: ${hms(total)}\n`;
      }
      content += `\n`;
    });
    filename = `kaoyan_diary_${todayStr()}.txt`;
    type = 'text/plain';
  }
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  notify(`已导出 ${filename}`);
}
