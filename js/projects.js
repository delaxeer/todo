import { generateId } from './utils.js';
import { saveProjects, saveCurrentProjectId } from './storage.js';
import { showNotification } from './ui.js';

export function createProject(projects, name) {
  const project = {
    id: generateId(),
    name,
    tasks: []
  };
  projects.push(project);
  saveProjects(projects);
  saveCurrentProjectId(project.id);
  showNotification(`Проект "${name}" создан`);
  return project.id;
}

export function switchProject(projects, projectId) {
  saveCurrentProjectId(projectId);
  return projects.find(p => p.id === projectId)?.tasks || [];
}