package com.yasboss.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.dto.LoginRequest;
import com.yasboss.model.User;
import com.yasboss.repository.UserRepository;
import com.yasboss.security.JwtUtils;
import com.yasboss.service.AuthService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User registeredUser = authService.register(user);
            return ResponseEntity.ok(registeredUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            log.info("🔐 SECURITY AUDIT: Login attempt for user: {}", loginRequest.getEmail());

            // 1. Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 2. Generate JWT
            String jwt = jwtUtils.generateToken(authentication); 

            // 3. Retrieve UserDetails and DB User
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // --- 🛡️ SECURITY AUDIT LOGGING ---
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            if (roles.isEmpty()) {
                log.error("⚠️ SECURITY WARNING: User {} has NO roles assigned!", loginRequest.getEmail());
            } else {
                log.info("✅ AUTHORITIES GRANTED for {}: {}", loginRequest.getEmail(), roles);
            }

            // 4. Check if account is enabled
            if (!Boolean.TRUE.equals(user.getEnabled())) {
                log.warn("🚫 Login blocked: Account {} is disabled", loginRequest.getEmail());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                    .body("Account is not enabled. Please contact Admin.");
            }

            // 5. Build Response Map
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt); 
            response.put("user", user);
            response.put("roles", roles); // ✨ Explicitly sending roles to frontend

            log.info("🚀 User {} logged in successfully with roles: {}", loginRequest.getEmail(), roles);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Login failed for user {}: {}", loginRequest.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
    }
}