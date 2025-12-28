package com.yasboss.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtils {
    // 1. Secret key must be at least 256 bits (32 characters) for HS256
    private final String jwtSecret = "your-very-secure-32-character-long-secret-key!!";
    private final int jwtExpirationMs = 86400000; // 24 hours

    // Helper method to generate the SecretKey object consistently
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey()) // Algorithm HS256 is auto-detected from the key
                .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey()) // Replaces setSigningKey
                .build()
                .parseSignedClaims(token) // Replaces parseClaimsJws
                .getPayload() // Replaces getBody
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            // Log specific exceptions (ExpiredJwtException, MalformedJwtException, etc.) if needed
            return false;
        }
    }
}