import { generateId, debounce, sortTasks, isOverdue } from './utils.js';
import { saveProjects, loadProjects, loadCurrentProjectId, exportTasks, importTasks } from './storage.js';
import { renderTasks, renderProjects, showModal, hideModal, showNotification } from './ui.js';
import { initDragAndDrop } from './dragdrop.js';
import { createProject, switchProject } from './projects.js';
import { notifyTaskAdded, notifyTaskDeleted, notifyTaskUpdated, notifyTaskOverdue } from './notifications.js';

let projects = loadProjects();
let currentProjectId = loadCurrentProjectId();
let currentTasks = projects.find(p => p.id === currentProjectId)?.tasks || [];

document.addEventListener('DOMContentLoaded', () => {
    // Установка начальной темы при загрузке
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.dataset.theme = savedTheme;
    document.getElementById('theme-toggle').checked = savedTheme === 'dark';

    renderProjects(projects, currentProjectId);
    renderTasks(currentTasks, currentProjectId);
    initDragAndDrop(currentTasks, currentProjectId, updateTasks);

    // Проверка просроченных задач при загрузке
    currentTasks.forEach(task => {
        if (isOverdue(task.deadline)) notifyTaskOverdue(task.title);
    });

    // Открытие модалки задачи
    document.getElementById('add-task-btn').addEventListener('click', () => {
        showModal('task-modal');
        document.getElementById('task-form').dataset.mode = 'add';
    });

    // Закрытие модалки задачи
    document.getElementById('close-modal').addEventListener('click', () => {
        hideModal('task-modal');
        resetForm(document.getElementById('task-form'));
    });

    // Открытие модалки проекта
    document.getElementById('add-project-btn').addEventListener('click', () => {
        showModal('project-modal');
    });

    // Закрытие модалки проекта
    document.getElementById('close-project-modal').addEventListener('click', () => {
        hideModal('project-modal');
        resetForm(document.getElementById('project-form'));
    });

    // Создание/редактирование задачи
    document.getElementById('task-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const mode = form.dataset.mode || 'add';
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const priority = document.getElementById('task-priority').value;
        const status = document.getElementById('task-status').value;
        const deadline = document.getElementById('task-deadline').value;

        if (!title) return showNotification('Название задачи обязательно!');

        if (deadline && new Date(deadline) < new Date()) {
            return showNotification('Срок не может быть в прошлом!');
        }

        const project = projects.find(p => p.id === currentProjectId);
        if (mode === 'add') {
            const task = {
                id: generateId(),
                title,
                description,
                priority,
                status,
                deadline: deadline || null,
                createdAt: new Date().toISOString()
            };
            project.tasks.push(task);
            notifyTaskAdded(title);
        } else {
            const taskId = form.dataset.taskId;
            const task = project.tasks.find(t => t.id === taskId);
            task.title = title;
            task.description = description;
            task.priority = priority;
            task.status = status;
            task.deadline = deadline || null;
            notifyTaskUpdated(title);
        }

        updateTasks(project.tasks);
        hideModal('task-modal');
        resetForm(form);
    });

    // Создание проекта
    document.getElementById('project-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('project-name').value.trim();
        if (!name) return showNotification('Название проекта обязательно!');
        currentProjectId = createProject(projects, name);
        currentTasks = projects.find(p => p.id === currentProjectId).tasks;
        renderProjects(projects, currentProjectId);
        renderTasks(currentTasks, currentProjectId);
        hideModal('project-modal');
        resetForm(e.target);
    });

    // Переключение проекта
    document.getElementById('project-select').addEventListener('change', (e) => {
        currentProjectId = e.target.value;
        currentTasks = switchProject(projects, currentProjectId);
        renderTasks(currentTasks, currentProjectId);
        initDragAndDrop(currentTasks, currentProjectId, updateTasks);
    });

    // Поиск задач
    document.getElementById('search-input').addEventListener('input', debounce(e => {
        const query = e.target.value.toLowerCase();
        const filteredTasks = currentTasks.filter(task =>
            task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)
        );
        renderTasks(filteredTasks, currentProjectId);
    }, 300));

    // Фильтрация по приоритету
    document.getElementById('filter-priority').addEventListener('change', (e) => {
        const priority = e.target.value;
        const filteredTasks = priority ? currentTasks.filter(task => task.priority === priority) : currentTasks;
        renderTasks(filteredTasks, currentProjectId);
    });

    // Сортировка задач
    document.getElementById('sort-tasks').addEventListener('change', (e) => {
        const sortType = e.target.value;
        const sortedTasks = sortTasks([...currentTasks], sortType);
        renderTasks(sortedTasks, currentProjectId);
    });

    // Экспорт задач
    document.getElementById('export-tasks').addEventListener('click', () => {
        exportTasks(projects);
        showNotification('Задачи экспортированы');
    });

    // Импорт задач
    document.getElementById('import-tasks').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            importTasks(file, (importedProjects) => {
                projects = importedProjects;
                saveProjects(projects);
                currentProjectId = loadCurrentProjectId();
                currentTasks = projects.find(p => p.id === currentProjectId)?.tasks || [];
                renderProjects(projects, currentProjectId);
                renderTasks(currentTasks, currentProjectId);
                showNotification('Задачи импортированы');
            });
        }
    });

    // Переключение темы
    document.getElementById('theme-toggle').addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('theme', theme);
    });

    // Обработка кликов по карточкам
    document.querySelector('.kanban-board').addEventListener('click', (e) => {
        const taskCard = e.target.closest('.task-card');
        if (!taskCard) return;
        const taskId = taskCard.dataset.id;
        const project = projects.find(p => p.id === currentProjectId);
        const task = project.tasks.find(t => t.id === taskId);

        if (e.target.classList.contains('delete-task')) {
            project.tasks = project.tasks.filter(t => t.id !== taskId);
            notifyTaskDeleted(task.title);
            updateTasks(project.tasks);
        } else if (e.target.classList.contains('edit-task')) {
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description || '';
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-status').value = task.status;
            document.getElementById('task-deadline').value = task.deadline ? task.deadline.slice(0, 16) : '';
            document.getElementById('task-form').dataset.mode = 'edit';
            document.getElementById('task-form').dataset.taskId = taskId;
            showModal('task-modal');
        } else if (e.target.classList.contains('status-option')) {
            const newStatus = e.target.dataset.status;
            task.status = newStatus;
            updateTasks(project.tasks);
            showNotification(`Статус задачи "${task.title}" изменен на ${newStatus}`);
        }
    });

    // Inline-редактирование
    document.querySelector('.kanban-board').addEventListener('focusout', (e) => {
        if (e.target.classList.contains('task-title') || e.target.classList.contains('task-description')) {
            const taskCard = e.target.closest('.task-card');
            const taskId = taskCard.dataset.id;
            const project = projects.find(p => p.id === currentProjectId);
            const task = project.tasks.find(t => t.id === taskId);
            if (e.target.classList.contains('task-title')) {
                task.title = e.target.textContent.trim();
            } else {
                task.description = e.target.textContent.trim();
            }
            updateTasks(project.tasks);
        }
    });

    // Включение редактирования при двойном клике
    document.querySelector('.kanban-board').addEventListener('dblclick', (e) => {
        if (e.target.classList.contains('task-title') || e.target.classList.contains('task-description')) {
            e.target.contentEditable = true;
            e.target.focus();
        }
    });
});

function updateTasks(tasks) {
    const project = projects.find(p => p.id === currentProjectId);
    project.tasks = tasks;
    saveProjects(projects);
    renderTasks(tasks, currentProjectId);
    initDragAndDrop(tasks, currentProjectId, updateTasks);
}

function resetForm(form) {
    form.reset();
    delete form.dataset.mode;
    delete form.dataset.taskId;
}