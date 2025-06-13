export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function resetForm(form) {
  form.reset();
  delete form.dataset.mode;
  delete form.dataset.taskId;
}

export function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export function sortTasks(tasks, sortType) {
  if (sortType === 'priority') {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  } else if (sortType === 'date') {
    return tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortType === 'deadline') {
    return tasks.sort((a, b) => {
      const dateA = a.deadline ? new Date(a.deadline) : Infinity;
      const dateB = b.deadline ? new Date(b.deadline) : Infinity;
      return dateA - dateB;
    });
  }
  return tasks;
}

export function isOverdue(deadline) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}