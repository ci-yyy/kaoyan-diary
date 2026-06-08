// ============================================================
//  Todos — 通用任务（累积式）+ 当天任务
// ============================================================

function renderTodos() {
  // General tasks — 从创建日期起至删除日期前累积显示
  const eligible = state.todos.filter(t => t.createdAt <= currentDate && (!t.deletedAt || t.deletedAt > currentDate));
  const doneTasks = diaryData[currentDate]?.doneTasks || {};

  if (!eligible.length) {
    todoGeneralList.innerHTML = '<li class="todo-empty">还没有通用任务 ✨</li>';
  } else {
    todoGeneralList.innerHTML = eligible.map(t => {
      const isDone = doneTasks[t.id] || false;
      return `<li class="todo-item" data-task-id="${t.id}">
        <button class="todo-check ${isDone ? 'done' : ''}" data-task-id="${t.id}" role="checkbox" aria-checked="${isDone}" aria-label="${isDone ? '取消完成' : '标记完成'}：${esc(t.text)}"></button>
        <span class="todo-text ${isDone ? 'done' : ''}">${esc(t.text)}</span>
        <button class="todo-del" data-task-id="${t.id}" aria-label="删除任务：${esc(t.text)}">✕</button>
      </li>`;
    }).join('');
    const items = [...todoGeneralList.querySelectorAll('.todo-item')];
    items.sort((a, b) => (a.querySelector('.todo-check').classList.contains('done')?1:0) - (b.querySelector('.todo-check').classList.contains('done')?1:0));
    items.forEach(el => todoGeneralList.appendChild(el));
  }

  // Daily tasks
  const dailyTodos = diaryData[currentDate]?.todos || [];
  if (!dailyTodos.length) {
    todoDailyList.innerHTML = '<li class="todo-empty">还没有当天任务 ✨</li>';
  } else {
    todoDailyList.innerHTML = dailyTodos.map((t, i) =>
      `<li class="todo-item" data-index="${i}">
        <button class="todo-check ${t.done ? 'done' : ''}" data-index="${i}" role="checkbox" aria-checked="${t.done}" aria-label="${t.done ? '取消完成' : '标记完成'}：${esc(t.text)}"></button>
        <span class="todo-text ${t.done ? 'done' : ''}">${esc(t.text)}</span>
        <button class="todo-del" data-index="${i}" aria-label="删除任务：${esc(t.text)}">✕</button>
      </li>`
    ).join('');
    const items = [...todoDailyList.querySelectorAll('.todo-item')];
    items.sort((a, b) => (a.querySelector('.todo-check').classList.contains('done')?1:0) - (b.querySelector('.todo-check').classList.contains('done')?1:0));
    items.forEach(el => todoDailyList.appendChild(el));
  }
}
