export class APIService {
  /**
   * Constructor del Servicio API
   * @param {string} baseUrl - URL base de la API
   */
  constructor(baseUrl) {
    this.baseUrl = baseUrl; // Almacena la URL base de la API
    // Define los endpoints disponibles como funciones para construir URLs dinámicas
    this.endpoints = {
      tasks: '', // Endpoint para todas las tareas
      task: (id) => `/${id}`, // Endpoint para una tarea específica
      taskStatus: (id) => `/${id}/completed`, // Endpoint para estado de tarea
      clearCompleted: '/clear_completed' // Endpoint para limpiar completadas
    };
  }

  /**
   * Obtiene todas las tareas desde la API
   * @returns {Promise<Array>} Lista de tareas
   */
  async fetchTasks() {
    try {
      const response = await fetch(this.baseUrl + this.endpoints.tasks);
      if (!response.ok) throw new Error('Failed to load tasks');
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error; // Relanza el error para que lo maneje el llamador
    }
  }

  /**
   * Crea una nueva tarea
   * @param {string} title - Título de la tarea
   * @returns {Promise<Object>} Tarea creada
   */
  async createTask(title) {
    return this._fetchWithHandling(
      this.baseUrl,
      'POST',
      { title, completed: false } // Crea tareas como no completadas por defecto
    );
  }

  /**
   * Actualiza el título de una tarea existente
   * @param {string} id - ID de la tarea a actualizar
   * @param {string} title - Nuevo título
   * @returns {Promise<Object>} Tarea actualizada
   */
  async updateTask(id, title) {
    return this._fetchWithHandling(
      this.baseUrl + this.endpoints.task(id),
      'PUT',
      { title } // Solo actualiza el título
    );
  }

  /**
   * Cambia el estado de completado de una tarea
   * @param {string} id - ID de la tarea
   * @param {boolean} completed - Nuevo estado (true/false)
   * @returns {Promise<Object>} Tarea actualizada
   */
  async toggleTaskCompletion(id, completed) {
    return this._fetchWithHandling(
      this.baseUrl + this.endpoints.taskStatus(id),
      'PATCH',
      { completed } // Solo actualiza el estado
    );
  }

  /**
   * Elimina una tarea específica
   * @param {string} id - ID de la tarea a eliminar
   * @returns {Promise<Object>} Resultado de la operación
   */
  async deleteTask(id) {
    return this._fetchWithHandling(
      this.baseUrl + this.endpoints.task(id),
      'DELETE' // No necesita body
    );
  }

  /**
   * Elimina todas las tareas completadas
   * @returns {Promise<Object>} Información sobre las tareas eliminadas
   */
  async clearCompletedTasks() {
    return this._fetchWithHandling(
      this.baseUrl + this.endpoints.clearCompleted,
      'DELETE' // No necesita body
    );
  }

  /**
   * Método interno para manejar todas las peticiones fetch con manejo de errores
   * @param {string} url - URL completa del endpoint
   * @param {string} method - Método HTTP (GET, POST, PUT, etc.)
   * @param {Object|null} body - Datos a enviar en el cuerpo (opcional)
   * @returns {Promise<Object>} Respuesta de la API
   * @private
   */
  async _fetchWithHandling(url, method, body = null) {
    try {
      // Configuración básica de la petición
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      // Si hay body, lo convierte a JSON y lo añade
      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      
      // Si la respuesta no es OK, extrae el mensaje de error
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Request failed with status ${response.status}`);
      }

      // Intenta parsear la respuesta como JSON, si falla devuelve objeto vacío
      return await response.json().catch(() => ({}));
    } catch (error) {
      console.error(`Error in ${method} request:`, error);
      throw error; // Relanza el error para manejo superior
    }
  }
}