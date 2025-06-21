package com.todo.todo_list.repository;


import com.todo.todo_list.model.Task;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ITaskRepository extends JpaRepository<Task, Long> {

    // Consulta personalizada para encontrar todas las tareas ordenadas por ID
    List<Task> findAllByOrderByIdAsc();

    // Consulta personalizada para eliminar tareas completadas
    @Modifying
    @Transactional
    @Query("DELETE FROM Task t WHERE t.completed = true")
    int deleteByCompleted(@Param("completed") boolean completed);

    // Nuevo metodo para actualizar solo el estado completed
    @Modifying
    @Transactional
    @Query("UPDATE Task t SET t.completed = :completed WHERE t.id = :id")
    void updateCompletedStatus(@Param("id") Long id, @Param("completed") boolean completed);



}