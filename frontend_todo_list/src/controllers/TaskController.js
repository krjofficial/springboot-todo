export class TaskController {
  /**
   * Constructor del Controlador de Tareas
   * @param {Object} apiService - Servicio para interactuar con la API
   * @param {Object} view - Vista para interactuar con la interfaz de usuario
   */
  constructor(apiService, view) {
    this.apiService = apiService; // Servicio para llamadas a la API
    this.view = view; // Vista para manipular el DOM
    this.state = {
      currentlyEditingId: null, // ID de la tarea en edición
      originalTitle: '' // Título original antes de editar
    };
  }

  /**
   * Inicializa el controlador cargando tareas y configurando eventos
   */
  init() {
    this.loadTasks(); // Carga las tareas iniciales
    this.setupEventListeners(); // Configura los event listeners
  }

  /**
   * Configura los event listeners para los elementos de la interfaz
   */
  setupEventListeners() {
    // Evento para el formulario de añadir/editar tarea
    this.view.elements.taskForm.addEventListener('submit', this.handleFormSubmit.bind(this));
    // Evento para el botón de limpiar tareas completadas
    this.view.elements.clearCompleted.addEventListener('click', this.handleClearCompleted.bind(this));
    // Eventos para la lista de tareas (clicks y cambios)
    this.view.elements.taskList.addEventListener('click', this.handleTaskListClick.bind(this));
    this.view.elements.taskList.addEventListener('change', this.handleTaskCheckboxChange.bind(this));
  }

  /**
   * Carga las tareas desde la API y las muestra en la interfaz
   */
  async loadTasks() {
    try {
      const tasks = await this.apiService.fetchTasks(); // Obtiene tareas de la API
      this.view.renderTasks(tasks, this.state.currentlyEditingId); // Renderiza las tareas
      this.view.updateTaskCounter(tasks); // Actualiza el contador
    } catch (error) {
      this.view.showNotification('Error loading tasks. Please refresh the page.', 'error');
    }
  }

  /**
   * Maneja el envío del formulario para crear/actualizar tareas
   * @param {Event} e - Evento de submit
   */
  async handleFormSubmit(e) {
    e.preventDefault();
    const title = this.view.elements.taskInput.value.trim(); // Obtiene el título de la tarea
    
    if (!title) return; // Valida que no esté vacío

    try {
      if (this.state.currentlyEditingId) {
        // Si estamos editando, actualiza la tarea existente
        await this.apiService.updateTask(this.state.currentlyEditingId, title);
        this.resetEditMode(); // Sale del modo edición
      } else {
        // Si no, crea una nueva tarea
        await this.apiService.createTask(title);
        this.view.resetInput(); // Limpia el input
      }
      this.loadTasks(); // Recarga las tareas
    } catch (error) {
      this.view.showNotification('Error saving task. Please try again.', 'error');
    }
  }

  /**
   * Maneja la eliminación de tareas completadas
   */
  async handleClearCompleted() {
    try {
      const result = await this.apiService.clearCompletedTasks();
      console.log(`Deleted ${result.deletedCount} tasks`);
      this.view.showNotification('Completed tasks cleared successfully!', 'success');
      this.loadTasks(); // Recarga las tareas después de eliminar
    } catch (error) {
      console.error('Error clearing completed tasks:', error);
      this.view.showNotification(error.message || 'Error clearing completed tasks. Please try again.', 'error');
    }
  }

  /**
   * Maneja los clics en la lista de tareas (editar, guardar, cancelar, eliminar)
   * @param {Event} e - Evento de click
   */
  handleTaskListClick(e) {
    // Si se hace clic en el botón de editar
    if (e.target.closest('.edit-btn')) {
      this.handleEditTask(e.target.closest('.edit-btn'));
      return;
    }
    
    // Si se hace clic en el botón de guardar edición
    if (e.target.closest('.save-edit-btn')) {
      this.handleSaveEdit(e.target.closest('.save-edit-btn'));
      return;
    }
    
    // Si se hace clic en el botón de cancelar edición
    if (e.target.closest('.cancel-edit-btn')) {
      this.resetEditMode();
      this.loadTasks();
      return;
    }
    
    // Si se hace clic en el botón de eliminar
    if (e.target.closest('.delete-btn')) {
      this.handleDeleteTask(e.target.closest('.delete-btn'));
    }
  }

  /**
   * Maneja el cambio de estado (completado/no completado) de una tarea
   * @param {Event} e - Evento de cambio
   */
  async handleTaskCheckboxChange(e) {
    if (!e.target.classList.contains('task-checkbox')) return;
    
    const checkbox = e.target;
    const taskId = checkbox.dataset.id;
    const isCompleted = checkbox.checked;
    const originalState = !isCompleted;

    try {
      // Actualiza el estado en la API
      await this.apiService.toggleTaskCompletion(taskId, isCompleted);
      // Actualiza la interfaz
      this.view.updateTaskInUI(taskId, isCompleted);
      this.updateTaskCounter();
    } catch (error) {
      console.error('Update failed:', error);
      checkbox.checked = originalState; // Revierte el cambio si falla
      
      // Muestra mensaje de error apropiado
      const errorMsg = error.message.includes('Failed to fetch')
        ? 'Network error. Please check your connection.'
        : `Update failed: ${error.message}`;
      
      this.view.showNotification(errorMsg, 'error');
    }
  }

  /**
   * Maneja la edición de una tarea
   * @param {HTMLElement} button - Botón de editar que fue clickeado
   */
  async handleEditTask(button) {
    const taskId = button.dataset.id;
    const taskElement = button.closest('li');
    const taskTitle = taskElement.querySelector('span').textContent;
    
    // Actualiza el estado para entrar en modo edición
    this.state.currentlyEditingId = taskId;
    this.state.originalTitle = taskTitle;
    this.view.elements.taskInput.value = taskTitle; // Muestra el título en el input
    this.view.focusInput(); // Enfoca el input
    this.view.updateSubmitButton('Update'); // Cambia el texto del botón
    this.loadTasks(); // Recarga las tareas para mostrar los controles de edición
  }

  /**
   * Maneja el guardado de una edición de tarea
   * @param {HTMLElement} button - Botón de guardar que fue clickeado
   */
  async handleSaveEdit(button) {
    const taskId = button.dataset.id;
    const editInput = button.closest('li').querySelector('.edit-input');
    const newTitle = editInput.value.trim();
    
    if (newTitle) {
      try {
        await this.apiService.updateTask(taskId, newTitle);
        this.resetEditMode(); // Sale del modo edición
        this.loadTasks(); // Recarga las tareas
      } catch (error) {
        this.view.showNotification('Error updating task. Please try again.', 'error');
      }
    }
  }

  /**
   * Maneja la eliminación de una tarea
   * @param {HTMLElement} button - Botón de eliminar que fue clickeado
   */
  async handleDeleteTask(button) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await this.apiService.deleteTask(button.dataset.id);
      this.loadTasks(); // Recarga las tareas después de eliminar
    } catch (error) {
      this.view.showNotification('Error deleting task. Please try again.', 'error');
    }
  }

  /**
   * Resetea el modo de edición
   */
  resetEditMode() {
    this.state.currentlyEditingId = null;
    this.state.originalTitle = '';
    this.view.resetInput(); // Limpia el input
    this.view.updateSubmitButton('Add'); // Restaura el texto del botón
  }

  /**
   * Actualiza el contador de tareas
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