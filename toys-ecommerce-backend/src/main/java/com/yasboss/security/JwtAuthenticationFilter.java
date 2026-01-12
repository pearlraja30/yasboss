package com.yasboss.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
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
    
    @Autowired 
    private UserDetailsService userDetailsService;

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
                        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                        
                        // Log authorities for debugging (Verify ROLE_ prefixes here)
                        log.debug("User {} authenticated with authorities: {}", email, userDetails.getAuthorities());
                        
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails, 
                                null, 
                                userDetails.getAuthorities()
                        );
                        
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        // 5. Populate Security Context
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            } catch (Exception e) {
                log.error("JWT Authentication Filter Error: {}", e.getMessage());
                // We don't throw an exception here so that the filter chain can continue 
                // and Spring Security can handle unauthorized access based on the config.
            }
        }
        
        // 6. Continue the Filter Chain
        filterChain.doFilter(request, response);
    }
}