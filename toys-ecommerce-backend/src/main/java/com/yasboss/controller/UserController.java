package com.yasboss.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.model.User;
import com.yasboss.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Requirement: Fetch profile data securely using JWT.
     * Path variable {email} removed to prevent unauthorized access.
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get()); // Returns ResponseEntity<User>
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found"); // Returns ResponseEntity<String>
        }
    }
    /**
     * Requirement: Update profile securely.
     * Identity is derived from token, not request body.
     */
    @PutMapping("/profile/update")
    public ResponseEntity<?> updateProfile(@RequestBody User updatedData) {
        // 1. Get identity from the secure JWT token
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        return userRepository.findByEmail(email)
            .map(user -> {
                // 2. Update allowed fields only
                user.setFullName(updatedData.getFullName());
                user.setPhone(updatedData.getPhone());
                
                User savedUser = userRepository.save(user);
                
                // Return the updated user object
                return ResponseEntity.ok(savedUser); 
            })
            // 3. Ensure the error branch returns a compatible ResponseEntity type
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    /**
     * Requirement: Change password securely.
     */
    @PutMapping("/profile/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        return userRepository.findByEmail(email)
            .map(user -> {
                if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Current password is incorrect");
                }

                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return ResponseEntity.ok("Password updated successfully");
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found"));
    }

    @GetMapping("/leaderboard")
    public List<Map<String, Object>> getLeaderboard() {
        return userRepository.findTop10ByOrderByRewardPointsDesc().stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            // Use fullName or Name depending on your Model field
            map.put("name", user.getFullName() != null ? user.getFullName() : user.getName());
            map.put("points", user.getRewardPoints());
            return map;
        }).collect(Collectors.toList());
    }
}