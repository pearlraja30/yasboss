package com.yasboss.controller;

import com.yasboss.model.Milestone;
import com.yasboss.repository.MilestoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parenting/milestones")
@CrossOrigin(origins = "http://localhost:5173") // Ensure this matches your React URL
public class MilestoneController {

    @Autowired
    private MilestoneRepository milestoneRepo;

    // GET all milestones for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Milestone>> getUserMilestones(@PathVariable Long userId) {
        System.out.println("Backend: Fetching milestones for User ID: " + userId);
        List<Milestone> milestones = milestoneRepo.findByUserIdOrderByAchievementDateDesc(userId);
        return ResponseEntity.ok(milestones);
    }

    // POST a new milestone
    @PostMapping
    public ResponseEntity<Milestone> addMilestone(@RequestBody Milestone milestone) {
        System.out.println("Backend: Saving new milestone: " + milestone.getTitle());
        Milestone saved = milestoneRepo.save(milestone);
        return ResponseEntity.ok(saved);
    }
}