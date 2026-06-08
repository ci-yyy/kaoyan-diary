// ============================================================
//  Goals — 目标设定
// ============================================================

function renderGoals() {
  if (!dirty.goals) return;
  goalSchool.value = state.goalSchool || '';
  goalMajor.value = state.goalMajor || '';
  autoWidth(goalSchool);
  autoWidth(goalMajor);

  let html = '';
  state.subjects.forEach(s => {
    const score = state.goalScores[s.key] || '';
    const maxScore = s.maxScore || 100;
    const c = s.color || 'var(--accent)';
    html += `<span class="hg-subject" data-key="${s.key}" style="border-color:${c};background:${c}11;">
      ${s.emoji}
      <input type="number" class="hg-score-input" data-key="${s.key}" value="${score}" min="0" max="${maxScore}" placeholder="—" aria-label="${s.name}目标分，满分${maxScore}">
      <span class="max">/${maxScore}</span>
    </span>`;
  });
  headerGoalSubjects.innerHTML = html;

  headerGoalSubjects.querySelectorAll('.hg-score-input').forEach(inp => {
    inp.addEventListener('change', () => {
      const key = inp.dataset.key;
      const val = inp.value.trim();
      state.goalScores[key] = val ? parseInt(val) : '';
      save();
      updateTotalScore();
    });
  });
  updateTotalScore();
  dirty.goals = false;
}

function updateTotalScore() {
  let total = 0;
  state.subjects.forEach(s => {
    const score = state.goalScores[s.key];
    if (score) total += parseInt(score);
  });
  document.getElementById('goalTotalScore').textContent = total || '0';
}
