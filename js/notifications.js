import { showNotification } from './ui.js';

export function notifyTaskAdded(title) {
  showNotification(`Задача "${title}" добавлена`);
}

export function notifyTaskDeleted(title) {
  showNotification(`Задача "${title}" удалена`);
}

export function notifyTaskUpdated(title) {
  showNotification(`Задача "${title}" обновлена`);
}

export function notifyTaskOverdue(title) {
  showNotification(`Задача "${title}" просрочена!`);
}