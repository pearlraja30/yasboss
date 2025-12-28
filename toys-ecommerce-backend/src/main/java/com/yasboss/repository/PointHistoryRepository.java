package com.yasboss.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.yasboss.model.PointHistory;

@Repository
public interface PointHistoryRepository extends JpaRepository<PointHistory, Long> {
    
    /**
     * Finds all reward transactions for a specific user, 
     * ordered by the most recent first.
     */
    List<PointHistory> findByUserEmailOrderByCreatedAtDesc(String userEmail);
}