
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
@CrossOrigin(origins = "*") // Allow requests from any origin (useful for development)
public class TaskController {

    private final ITaskRepository repository;

    public TaskController(ITaskRepository repository) { // contructor
        this.repository = repository;
    }

   // Get all tasks sorted by ID
    @GetMapping
    public List<Task> getAllTasks() {
        return repository.findAllByOrderByIdAsc();
    }

   // Create a new task
    @PostMapping
    public Task createTask(@RequestBody Task task) {
        // Ensure that the completed status is false by default if not specified
        if (task.getCompleted() == null) {
            task.setCompleted(false);
        }
        return repository.save(task);
    }

    // Specific endpoint to change only the completed status
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

    // Update an existing task
    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody Task taskDetails) {
        return repository.findById(id)
                .map(task -> {
                    // Update only the allowed fields
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

    // Delete a specific task
    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        repository.deleteById(id);
    }

   // Delete all completed tasks (additional endpoint)
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