package com.yasboss.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.model.PointHistory;
import com.yasboss.repository.PointHistoryRepository;
import com.yasboss.service.RewardService;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/rewards")
public class RewardController {

    @Autowired
    private RewardService rewardService;

    @Autowired
    private PointHistoryRepository pointHistoryRepository;


    @PostMapping("/complete-quiz")
    public ResponseEntity<?> completeQuiz(@RequestBody Map<String, Object> payload) {
        // ✨ THE FIX: Get the email from the authenticated Security Context
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        Integer points = (Integer) payload.get("pointsEarned");
        String quizId = (String) payload.get("quizId");

        if (email == null || email.equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        // Update the points in the DB
        int newBalance = rewardService.updateQuizPoints(email, points);
        
        // Log the transaction for the Reward Tracker (Requirement #4)
        rewardService.logTransaction(email, points, "QUIZ_COMPLETED", quizId);

        Map<String, Object> response = new HashMap<>();
        response.put("newBalance", newBalance);
        response.put("message", "Rewards claimed successfully!");
        
        return ResponseEntity.ok(response);
    }

    @Transactional
    public void logTransaction(String email, Integer points, String type, String quizId) {
        PointHistory history = new PointHistory();
        history.setUserEmail(email);
        history.setPointsChanged(points);
        history.setTransactionType(type);
        history.setQuizId(quizId);
        history.setDescription("Points earned from Quiz: " + quizId);
        
        pointHistoryRepository.save(history);
    }

    @GetMapping("/history")
    public ResponseEntity<List<PointHistory>> getHistory() {
        // Identify user from JWT
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(pointHistoryRepository.findByUserEmailOrderByCreatedAtDesc(email));
    }
}