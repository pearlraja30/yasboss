package com.yasboss.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtils {
    // Note: In production, move this to application.properties
    private final String jwtSecret = "your-very-secure-32-character-long-secret-key!!";
    private final int jwtExpirationMs = 86400000; // 24 hours

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // ✨ Updated for Standard Login (requires authorities now)
    public String generateToken(Authentication authentication) {
        String email;
        if (authentication.getPrincipal() instanceof OAuth2User oauth2User) {
            email = (String) oauth2User.getAttributes().get("email");
            if (email == null) {
                email = (String) oauth2User.getAttributes().get("login");
            }
        } else {
            email = authentication.getName();
        }

        // ✨ Extract roles from authentication object
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return createToken(email, roles);
    }

    // ✨ Utility for generating token by email (ensure you fetch roles from DB first)
    public String generateTokenFromEmail(String email, List<String> roles) {
        return createToken(email, roles);
    }

    private String createToken(String subject, List<String> roles) {
        return Jwts.builder()
                .subject(subject)
                .claim("roles", roles) // ✨ Add roles to the JWT claims
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // ✨ Helper to extract roles on the backend if needed
    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("roles", List.class);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}