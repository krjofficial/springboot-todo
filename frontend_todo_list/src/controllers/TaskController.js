export class TaskController {
  /**
   * Task Controller Constructor
   * @param {Object} apiService - Service to interact with the API
   * @param {Object} view - View to interact with the user interface
   */
  constructor(apiService, view) {
    this.apiService = apiService; // Service for API calls
    this.view = view; // View to manipulate the DOM
    this.state = {
      currentlyEditingId: null, // ID of the task being edited
      originalTitle: '' // Original title before editing
    };
  }

  /**
   * Initializes the controller by loading tasks and setting up events
   */
  init() {
    this.loadTasks(); // Load initial tasks
    this.setupEventListeners(); // Set up event listeners
  }

  /**
   * Sets up event listeners for UI elements
   */
  setupEventListeners() {
    // Event for the add/edit task form
    this.view.elements.taskForm.addEventListener('submit', this.handleFormSubmit.bind(this));
    // Event for the button to clear completed tasks
    this.view.elements.clearCompleted.addEventListener('click', this.handleClearCompleted.bind(this));
    // Events for the task list (clicks and changes)
    this.view.elements.taskList.addEventListener('click', this.handleTaskListClick.bind(this));
    this.view.elements.taskList.addEventListener('change', this.handleTaskCheckboxChange.bind(this));
  }

  /**
   * Loads tasks from the API and displays them in the UI
   */
  async loadTasks() {
    try {
      const tasks = await this.apiService.fetchTasks(); // Get tasks from the API
      this.view.renderTasks(tasks, this.state.currentlyEditingId); // Render tasks
      this.view.updateTaskCounter(tasks); // Update the counter
    } catch (error) {
      this.view.showNotification('Error loading tasks. Please refresh the page.', 'error');
    }
  }

  /**
   * Handles form submission for creating/updating tasks
   * @param {Event} e - Submit event
   */
  async handleFormSubmit(e) {
    e.preventDefault();
    const title = this.view.elements.taskInput.value.trim(); // Get the task title
    
    if (!title) return; // Validate that it's not empty

    try {
      if (this.state.currentlyEditingId) {
        // If we are editing, update the existing task
        await this.apiService.updateTask(this.state.currentlyEditingId, title);
        this.resetEditMode(); // Exit edit mode
      } else {
        // Otherwise, create a new task
        await this.apiService.createTask(title);
        this.view.resetInput(); // Clear the input
      }
      this.loadTasks(); // Reload tasks
    } catch (error) {
      this.view.showNotification('Error saving task. Please try again.', 'error');
    }
  }

  /**
   * Handles deletion of completed tasks
   */
  async handleClearCompleted() {
    try {
      const result = await this.apiService.clearCompletedTasks();
      console.log(`Deleted ${result.deletedCount} tasks`);
      this.view.showNotification('Completed tasks cleared successfully!', 'success');
      this.loadTasks(); // Reload tasks after deletion
    } catch (error) {
      console.error('Error clearing completed tasks:', error);
      this.view.showNotification(error.message || 'Error clearing completed tasks. Please try again.', 'error');
    }
  }

  /**
   * Handles clicks in the task list (edit, save, cancel, delete)
   * @param {Event} e - Click event
   */
  handleTaskListClick(e) {
    // If edit button is clicked
    if (e.target.closest('.edit-btn')) {
      this.handleEditTask(e.target.closest('.edit-btn'));
      return;
    }
    
    // If save edit button is clicked
    if (e.target.closest('.save-edit-btn')) {
      this.handleSaveEdit(e.target.closest('.save-edit-btn'));
      return;
    }
    
    // If cancel edit button is clicked
    if (e.target.closest('.cancel-edit-btn')) {
      this.resetEditMode();
      this.loadTasks();
      return;
    }
    
    // If delete button is clicked
    if (e.target.closest('.delete-btn')) {
      this.handleDeleteTask(e.target.closest('.delete-btn'));
    }
  }

  /**
   * Handles task status change (completed/incomplete)
   * @param {Event} e - Change event
   */
  async handleTaskCheckboxChange(e) {
    if (!e.target.classList.contains('task-checkbox')) return;
    
    const checkbox = e.target;
    const taskId = checkbox.dataset.id;
    const isCompleted = checkbox.checked;
    const originalState = !isCompleted;

    try {
      // Update the status in the API
      await this.apiService.toggleTaskCompletion(taskId, isCompleted);
      // Update the UI
      this.view.updateTaskInUI(taskId, isCompleted);
      this.updateTaskCounter();
    } catch (error) {
      console.error('Update failed:', error);
      checkbox.checked = originalState; // Revert the change if it fails
      
      // Show appropriate error message
      const errorMsg = error.message.includes('Failed to fetch')
        ? 'Network error. Please check your connection.'
        : `Update failed: ${error.message}`;
      
      this.view.showNotification(errorMsg, 'error');
    }
  }

  /**
   * Handles editing of a task
   * @param {HTMLElement} button - Edit button that was clicked
   */
  async handleEditTask(button) {
    const taskId = button.dataset.id;
    const taskElement = button.closest('li');
    const taskTitle = taskElement.querySelector('span').textContent;
    
    // Update state to enter edit mode
    this.state.currentlyEditingId = taskId;
    this.state.originalTitle = taskTitle;
    this.view.elements.taskInput.value = taskTitle; // Show title in input
    this.view.focusInput(); // Focus the input
    this.view.updateSubmitButton('Update'); // Change button text
    this.loadTasks(); // Reload tasks to show edit controls
  }

  /**
   * Handles saving of an edited task
   * @param {HTMLElement} button - Save button that was clicked
   */
  async handleSaveEdit(button) {
    const taskId = button.dataset.id;
    const editInput = button.closest('li').querySelector('.edit-input');
    const newTitle = editInput.value.trim();
    
    if (newTitle) {
      try {
        await this.apiService.updateTask(taskId, newTitle);
        this.resetEditMode(); // Exit edit mode
        this.loadTasks(); // Reload tasks
      } catch (error) {
        this.view.showNotification('Error updating task. Please try again.', 'error');
      }
    }
  }

  /**
   * Handles deletion of a task
   * @param {HTMLElement} button - Delete button that was clicked
   */
  async handleDeleteTask(button) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await this.apiService.deleteTask(button.dataset.id);
      this.loadTasks(); // Reload tasks after deletion
    } catch (error) {
      this.view.showNotification('Error deleting task. Please try again.', 'error');
    }
  }

  /**
   * Resets edit mode
   */
  resetEditMode() {
    this.state.currentlyEditingId = null;
    this.state.originalTitle = '';
    this.view.resetInput(); // Clear the input
    this.view.updateSubmitButton('Add'); // Restore button text
  }

  /**
   * Updates the task counter
   */
  async updateTaskCounter() {
    try {
      const tasks = await this.apiService.fetchTasks();
      this.view.updateTaskCounter(tasks);
    } catch (error) {
      console.error('Error updating task counter:', error);
    }
  }
}
