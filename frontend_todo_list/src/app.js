import { APIService } from './services/APIService.js';
import { TaskView } from './views/TaskView.js';
import { TaskController } from './controllers/TaskController.js';
document.addEventListener('DOMContentLoaded', () => {
  const apiService = new APIService('http://localhost:8080/api/tasks');
  const taskView = new TaskView();
  const taskController = new TaskController(apiService, taskView);
  taskController.init();
});
