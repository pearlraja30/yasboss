package com.yasboss.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.yasboss.model.User;
import com.yasboss.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User login(String email, String password) {
        // 1. Find the user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // 2. Compare the raw password with the hashed password in DB
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // 3. Return the user object (excluding the password for safety in a real app)
        return user;
    }

    public User register(User user) {
       if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Encode password and set defaults
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Ensure phone and address are explicitly handled if needed
        user.setPhone(user.getPhone()); 
        user.setAddress(user.getAddress());
        user.setRewardPoints(0);

        return userRepository.save(user);
    }
}