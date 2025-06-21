
package com.todo.todo_list.controller;

import com.todo.todo_list.model.Task;
import com.todo.todo_list.repository.ITaskRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;



@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*") // Permite peticiones desde cualquier origen (útil para desarrollo)
public class TaskController {

    private final ITaskRepository repository;

    public TaskController(ITaskRepository repository) {
        this.repository = repository;
    }

    // Obtener todas las tareas ordenadas por ID
    @GetMapping
    public List<Task> getAllTasks() {
        return repository.findAllByOrderByIdAsc();
    }

    // Crear una nueva tarea
    @PostMapping
    public Task createTask(@RequestBody Task task) {
        // Asegura que el estado completed sea false por defecto si no se especifica
        if (task.getCompleted() == null) {
            task.setCompleted(false);
        }
        return repository.save(task);
    }

    // Endpoint específico para cambiar solo el estado completed
    @PatchMapping("/{id}/completed")
    public ResponseEntity<Void> updateCompletedStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {

        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        Boolean completed = request.get("completed");
        if (completed == null) {
            return ResponseEntity.badRequest().build();
        }

        repository.updateCompletedStatus(id, completed);
        return ResponseEntity.ok().build();
    }

    // Actualizar una tarea existente
    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody Task taskDetails) {
        return repository.findById(id)
                .map(task -> {
                    // Actualiza solo los campos permitidos
                    if (taskDetails.getTitle() != null) {
                        task.setTitle(taskDetails.getTitle());
                    }
                    if (taskDetails.getCompleted() != null) {
                        task.setCompleted(taskDetails.getCompleted());
                    }
                    return repository.save(task);
                })
                .orElseThrow(() -> new RuntimeException("Task not found with id " + id));
    }

    // Eliminar una tarea específica
    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        repository.deleteById(id);
    }

    // Eliminar todas las tareas completadas (endpoint adicional)
   @DeleteMapping("/clear_completed")
    public ResponseEntity<?> deleteCompletedTasks() {
        try {
            int deletedCount = repository.deleteByCompleted(true);
            return ResponseEntity.ok().body(Map.of(
                    "message", "Successfully deleted completed tasks",
                    "deletedCount", deletedCount
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete completed tasks"));
        }
    }
}