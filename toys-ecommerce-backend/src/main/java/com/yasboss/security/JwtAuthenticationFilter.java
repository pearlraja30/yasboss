package com.yasboss.security;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired 
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // 1. Extract Authorization Header
        String authHeader = request.getHeader("Authorization");

        // 2. Validate Header Format
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                // 3. Validate Token Signature and Expiry
                if (jwtUtils.validateToken(token)) {
                    String email = jwtUtils.getEmailFromToken(token);

                    // 4. Authenticate if not already authenticated in this request context
                    if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        
                        // ✨ NEW: Extract Roles directly from the JWT claims 
                        // This avoids an extra database hit via userDetailsService
                        List<String> roles = jwtUtils.getRolesFromToken(token);
                        
                        // Convert String roles (e.g., "ROLE_CUSTOMER") into Spring Authorities
                        List<SimpleGrantedAuthority> authorities = roles.stream()
                                .map(SimpleGrantedAuthority::new)
                                .collect(Collectors.toList());

                        log.debug("Authenticating user {} from JWT with roles: {}", email, roles);

                        // 5. Create Authentication Token with extracted authorities
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                email, // Principal can be the email string in stateless JWT
                                null, 
                                authorities
                        );
                        
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        // 6. Populate Security Context
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            } catch (Exception e) {
                log.error("JWT Authentication Filter Error: {}", e.getMessage());
            }
        }
        
        // 7. Continue the Filter Chain
        filterChain.doFilter(request, response);
    }
}