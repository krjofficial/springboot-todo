export class APIService {
  /**
   * API Service Constructor
   * @param {string} baseUrl - Base URL of the API
   */
  constructor(baseUrl) {
    this.baseUrl = baseUrl; // Stores the base URL of the API
    // Defines available endpoints as functions to build dynamic URLs
    this.endpoints = {
      tasks: '', // Endpoint for all tasks
      task: (id) => `/${id}`, // Endpoint for a specific task
      taskStatus: (id) => `/${id}/completed`, // Endpoint for task status
      clearCompleted: '/clear_completed' // Endpoint to clear completed tasks
    };
  }

  /**
   * Retrieves all tasks from the API
   * @returns {Promise<Array>} List of tasks
   */
  async fetchTasks() {
    try {
      const response = await fetch(this.baseUrl + this.endpoints.tasks);
      if (!response.ok) throw new Error('Failed to load tasks');
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error; // Rethrow the error for the caller to handle
    }
  }

  /**
   * Creates a new task
   * @param {string} title - Task title
   * @returns {Promise<Object>} Created task
   */
  async createTask(title) {
    return this._fetchWithHandling(
      this.baseUrl,
      'POST',
      { title, completed: false } // Creates tasks as incomplete by default
    );
  }

  /**
   * Updates the title of an existing task
   * @param {string} id - ID of the task to update
   * @param {string} title - New title
   * @returns {Promise<Object>} Updated task
   */
  async updateTask(id, title) {
    return this._fetchWithHandling(
      this.baseUrl + this.endpoints.task(id),
      'PUT',
      { title } // Only updates the title
    );
  }

  /**
   * Changes the completed status of a task
   * @param {string} id - Task ID
   * @param {boolean} completed - New status (true/false)
   * @returns {Promise<Object>} Updated task
   */
  async toggleTaskCompletion(id, completed) {
    return this._fetchWithHandling(
      this.baseUrl + this.endpoints.taskStatus(id),
      'PATCH',
      { completed } // Only updates the status
    );
  }

  /**
   * Deletes a specific task
   * @param {string} id - ID of the task to delete
   * @returns {Promise<Object>} Result of the operation
   */
  async deleteTask(id) {
    return this._fetchWithHandling(
      this.baseUrl + this.endpoints.task(id),
      'DELETE' // No body needed
    );
  }

  /**
   * Deletes all completed tasks
   * @returns {Promise<Object>} Information about the deleted tasks
   */
  async clearCompletedTasks() {
    return this._fetchWithHandling(
      this.baseUrl + this.endpoints.clearCompleted,
      'DELETE' // No body needed
    );
  }

  /**
   * Internal method to handle all fetch requests with error handling
   * @param {string} url - Full endpoint URL
   * @param {string} method - HTTP method (GET, POST, PUT, etc.)
   * @param {Object|null} body - Data to send in the body (optional)
   * @returns {Promise<Object>} API response
   * @private
   */
  async _fetchWithHandling(url, method, body = null) {
    try {
      // Basic request configuration
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      // If there's a body, convert it to JSON and add it
      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      
      // If the response is not OK, extract the error message
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Request failed with status ${response.status}`);
      }

      // Try to parse the response as JSON, return empty object if it fails
      return await response.json().catch(() => ({}));
    } catch (error) {
      console.error(`Error in ${method} request:`, error);
      throw error; // Rethrow the error for higher-level handling
    }
  }
}
