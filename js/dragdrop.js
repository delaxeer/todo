export function initDragAndDrop(tasks, projectId, updateTasks) {
  const taskContainers = document.querySelectorAll('.tasks');

  taskContainers.forEach(container => {
    container.addEventListener('dragover', e => {
      e.preventDefault();
      const afterElement = getDragAfterElement(container, e.clientY);
      const draggable = document.querySelector('.dragging');
      if (afterElement == null) {
        container.appendChild(draggable);
      } else {
        container.insertBefore(draggable, afterElement);
      }
    });

    container.addEventListener('drop', e => {
      e.preventDefault();
      const taskId = e.target.closest('.task-card')?.dataset.id || document.querySelector('.dragging').dataset.id;
      const newStatus = container.dataset.status;
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.status = newStatus;
        updateTasks(tasks);
      }
    });
  });

  document.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('dragstart', () => {
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      }
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
}