package com.yasboss.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yasboss.model.User;
import com.yasboss.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class RewardService {

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public int updateQuizPoints(String email, int pointsEarned) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        int currentPoints = user.getRewardPoints() != null ? user.getRewardPoints() : 0;
        int newBalance = currentPoints + pointsEarned;
        
        user.setRewardPoints(newBalance);
        userRepository.save(user);
        
        return newBalance;
    }

    public void logTransaction(String email, Integer points, String type, String quizId) {
        // This method is now moved to RewardController for transactional context
    }


}