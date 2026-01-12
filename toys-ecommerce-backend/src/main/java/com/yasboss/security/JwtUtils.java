package com.yasboss.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtils {
    private final String jwtSecret = "your-very-secure-32-character-long-secret-key!!";
    private final int jwtExpirationMs = 86400000; // 24 hours

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // ✨ Overload for Standard Login
    public String generateToken(String email) {
        return createToken(email);
    }

    // ✨ NEW: Overload for OAuth2 Success Handler
    public String generateToken(Authentication authentication) {
        String email;
        if (authentication.getPrincipal() instanceof OAuth2User oauth2User) {
            // Extract email from OAuth2 attributes
            email = (String) oauth2User.getAttributes().get("email");
            if (email == null) {
                email = (String) oauth2User.getAttributes().get("login"); // GitHub fallback
            }
        } else {
            email = authentication.getName();
        }
        return createToken(email);
    }

    private String createToken(String subject) {
        return Jwts.builder()
                .subject(subject)
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