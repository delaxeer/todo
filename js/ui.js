import { isOverdue } from './utils.js';

export function renderTasks(tasks, projectId) {
  const columns = {
    'todo': document.querySelector('[data-status="todo"] .tasks'),
    'in-progress': document.querySelector('[data-status="in-progress"] .tasks'),
    'done': document.querySelector('[data-status="done"] .tasks')
  };

  Object.values(columns).forEach(column => column.innerHTML = '');

  tasks.forEach(task => {
    const taskCard = document.createElement('div');
    taskCard.classList.add('task-card');
    if (isOverdue(task.deadline)) taskCard.classList.add('overdue');
    taskCard.dataset.id = task.id;
    taskCard.dataset.projectId = projectId;
    taskCard.draggable = true;
    taskCard.innerHTML = `
      <h3 contenteditable="false" class="task-title">${task.title}</h3>
      <p contenteditable="false" class="task-description">${task.description || ''}</p>
      <div class="priority priority-${task.priority}">Приоритет: ${task.priority}</div>
      <div class="deadline ${isOverdue(task.deadline) ? 'overdue' : ''}">
        Срок: ${task.deadline ? new Date(task.deadline).toLocaleString('ru-RU') : 'Не задан'}
      </div>
      <div class="status-slider" data-task-id="${task.id}">
        <span class="status-option ${task.status === 'todo' ? 'active' : ''}" data-status="todo">To Do</span>
        <span class="status-option ${task.status === 'in-progress' ? 'active' : ''}" data-status="in-progress">In Progress</span>
        <span class="status-option ${task.status === 'done' ? 'active' : ''}" data-status="done">Done</span>
      </div>
      <button class="edit-task">Изменить</button>
      <button class="delete-task">Удалить</button>
    `;
    columns[task.status].appendChild(taskCard);
  });
}

export function renderProjects(projects, currentProjectId) {
  const select = document.getElementById('project-select');
  select.innerHTML = '<option value="">Выберите проект</option>';
  projects.forEach(project => {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = project.name;
    if (project.id === currentProjectId) option.selected = true;
    select.appendChild(option);
  });
}

export function showModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
}

export function hideModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

export function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.remove('hidden');
  setTimeout(() => notification.classList.add('hidden'), 3000);
}