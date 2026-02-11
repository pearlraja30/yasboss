package com.yasboss.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.yasboss.model.User;
import com.yasboss.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional 
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // ✨ Improved Role Mapping
        List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> {
                    String roleName = role.getName().toUpperCase().trim(); // Force Uppercase
                    if (!roleName.startsWith("ROLE_")) {
                        roleName = "ROLE_" + roleName;
                    }
                    log.info("Assigning authority: {} to user: {}", roleName, email);
                    return new SimpleGrantedAuthority(roleName);
                })
                .collect(Collectors.toList());

        // ✨ Safe check for the Enabled field (Prevents the Boolean null crash)
        boolean isEnabled = Boolean.TRUE.equals(user.getEnabled());

        return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPassword(),
            isEnabled, 
            true, 
            true, 
            true, 
            authorities
        );
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    // Inside UserService.java

    @Transactional
    public void refundPoints(String email, Integer pointsToRefund) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        // Increment the existing points
        Integer currentPoints = user.getRewardPoints() != null ? user.getRewardPoints() : 0;
        user.setRewardPoints(currentPoints + pointsToRefund);
        
        userRepository.save(user);
        log.info("Refunded {} points to user {}", pointsToRefund, email);
    }
}
