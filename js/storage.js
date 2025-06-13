export function saveProjects(projects) {
  localStorage.setItem('projects', JSON.stringify(projects));
}

export function loadProjects() {
  const projects = localStorage.getItem('projects');
  return projects ? JSON.parse(projects) : [{ id: 'default', name: 'Основной проект', tasks: [] }];
}

export function saveCurrentProjectId(projectId) {
  localStorage.setItem('currentProjectId', projectId);
}

export function loadCurrentProjectId() {
  return localStorage.getItem('currentProjectId') || 'default';
}

export function exportTasks(projects) {
  const data = JSON.stringify(projects, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kanban_tasks.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function importTasks(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const projects = JSON.parse(e.target.result);
      callback(projects);
    } catch (error) {
      console.error('Ошибка импорта:', error);
    }
  };
  reader.readAsText(file);
}