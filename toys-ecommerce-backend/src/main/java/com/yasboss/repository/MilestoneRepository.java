package com.yasboss.repository;

import com.yasboss.model.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    // Find all milestones for a specific user, newest first
    List<Milestone> findByUserIdOrderByAchievementDateDesc(Long userId);
}