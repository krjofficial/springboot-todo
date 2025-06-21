export class TaskView {
  constructor() {
    // ====================
    // DOM ELEMENT REFERENCES
    // ====================
    // Initialize references to all DOM elements needed for the task manager
    this.elements = {
      taskForm: document.getElementById('taskForm'),
      taskInput: document.getElementById('taskInput'),
      taskList: document.getElementById('taskList'),
      taskCount: document.getElementById('taskCount'),
      clearCompleted: document.getElementById('clearCompleted'),
      submitButton: document.querySelector('#taskForm button[type="submit"]')
    };
  }

  // ====================
  // TASK RENDERING
  // ====================
  /**
   * Renders all tasks in the task list
   * @param {Array} tasks - Array of task objects
   * @param {string|null} currentlyEditingId - ID of the task currently being edited
   */
  renderTasks(tasks, currentlyEditingId) {
    if (tasks.length === 0) {
      this.elements.taskList.innerHTML = '<p class="text-forest-500 text-center py-4">No tasks yet. Add one above!</p>';
      return;
    }
    
    this.elements.taskList.innerHTML = tasks.map(task => 
      this.createTaskElement(task, currentlyEditingId === task.id)
    ).join('');
  }

  // ====================
  // TASK ELEMENT CREATION
  // ====================
  /**
   * Creates HTML for a task element based on whether it's being edited
   * @param {Object} task - Task object
   * @param {boolean} isEditing - Whether the task is in edit mode
   * @returns {string} HTML string for the task element
   */
  createTaskElement(task, isEditing) {
    if (isEditing) {
      return this.createEditModeTaskElement(task);
    }
    return this.createNormalTaskElement(task);
  }

  /**
   * Creates HTML for a normal (non-editing) task element
   * @param {Object} task - Task object
   * @returns {string} HTML string for the task element
   */
  createNormalTaskElement(task) {
    return `
      <li class="flex items-center justify-between p-3 bg-forest-50 rounded-lg border border-forest-100 hover:bg-forest-100/50 transition-all group ${task.completed ? 'opacity-75' : ''}" data-id="${task.id}">
        <div class="flex items-center">
          <input type="checkbox" ${task.completed ? 'checked' : ''}
                 class="h-5 w-5 text-forest-600 rounded border-forest-300 focus:ring-forest-500 mr-3 task-checkbox"
                 data-id="${task.id}">
          <span class="${task.completed ? 'line-through text-forest-500' : 'text-forest-800'}">${task.title}</span>
        </div>
        <div class="flex space-x-2">
          <button class="text-forest-500 hover:text-forest-700 opacity-0 group-hover:opacity-100 transition-opacity edit-btn" data-id="${task.id}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button class="text-forest-500 hover:text-forest-700 opacity-0 group-hover:opacity-100 transition-opacity delete-btn" data-id="${task.id}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </li>
    `;
  }

  /**
   * Creates HTML for a task element in edit mode
   * @param {Object} task - Task object
   * @returns {string} HTML string for the task element in edit mode
   */
  createEditModeTaskElement(task) {
    return `
      <li class="flex items-center justify-between p-3 bg-forest-50 rounded-lg border border-forest-100 hover:bg-forest-100/50 transition-all group ${task.completed ? 'opacity-75' : ''}" data-id="${task.id}">
        <div class="flex items-center w-full">
          <input type="checkbox" ${task.completed ? 'checked' : ''}
                 class="h-5 w-5 text-forest-600 rounded border-forest-300 focus:ring-forest-500 mr-3 task-checkbox"
                 data-id="${task.id}">
          <input type="text" value="${task.title}" 
                 class="flex-grow px-3 py-1 border-2 border-forest-300 rounded-lg focus:outline-none focus:border-forest-500 edit-input">
        </div>
        <div class="flex space-x-2">
          <button class="text-forest-500 hover:text-forest-700 save-edit-btn" data-id="${task.id}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <button class="text-forest-500 hover:text-forest-700 cancel-edit-btn" data-id="${task.id}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </li>
    `;
  }

  // ====================
  // UI UPDATES
  // ====================
  /**
   * Updates the visual state of a task in the UI
   * @param {string} taskId - ID of the task to update
   * @param {boolean} isCompleted - Whether the task is completed
   */
  updateTaskInUI(taskId, isCompleted) {
    const taskElement = this.elements.taskList.querySelector(`li[data-id="${taskId}"]`);
    if (!taskElement) return;

    const textElement = taskElement.querySelector('span');
    const checkbox = taskElement.querySelector('.task-checkbox');
    
    if (textElement && checkbox) {
      textElement.classList.toggle('line-through', isCompleted);
      textElement.classList.toggle('text-forest-500', isCompleted);
      textElement.classList.toggle('text-forest-800', !isCompleted);
      checkbox.checked = isCompleted;
      taskElement.classList.toggle('opacity-75', isCompleted);
    }
  }

  /**
   * Updates the task counter display
   * @param {Array} tasks - Array of task objects
   */
  updateTaskCounter(tasks) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    
    if (totalTasks === 0) {
      this.elements.taskCount.textContent = 'No tasks';
    } else if (completedTasks === totalTasks) {
      this.elements.taskCount.textContent = `All ${totalTasks} tasks completed!`;
    } else {
      this.elements.taskCount.textContent = `${completedTasks} of ${totalTasks} tasks completed`;
    }
  }

  /**
   * Updates the submit button text and icon based on context
   * @param {string} text - Button text ('Update' or 'Add Task')
   */
  updateSubmitButton(text) {
    const icon = text === 'Update' ? `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    ` : `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
      </svg>
    `;
    
    this.elements.submitButton.innerHTML = `${icon}${text}`;
  }

  // ====================
  // FORM HANDLING
  // ====================
  /**
   * Resets the task input field
   */
  resetInput() {
    this.elements.taskInput.value = '';
  }

  /**
   * Focuses the task input field
   */
  focusInput() {
    this.elements.taskInput.focus();
  }

  // ====================
  // NOTIFICATIONS
  // ====================
  /**
   * Shows a temporary notification message
   * @param {string} message - Message to display
   * @param {string} type - Type of notification ('error' or success)
   */
  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${
      type === 'error' ? 'bg-red-500' : 'bg-green-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}