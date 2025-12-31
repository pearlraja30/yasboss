package com.yasboss.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.yasboss.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    // Use constructor injection for the filter
    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disabled for stateless JWT
            .cors(Customizer.withDefaults()) // Uses the corsConfigurationSource bean below
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Requirement: Stateless
            .authorizeHttpRequests(auth -> auth
                // Public Endpoints
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/categories/**").permitAll()
                 .requestMatchers("/api/products/filter/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()

                // This fixes the 403 errors on age-0-2.jpg, etc.
                .requestMatchers("/uploads/**", "/images/**", "/static/**").permitAll()
                .requestMatchers("/process-payment").permitAll()

                 // Admin Endpoints
                .requestMatchers(HttpMethod.GET, "/api/products").hasRole("ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/products/**").hasRole("ADMIN")
                .requestMatchers("/api/orders/user/**").hasAnyRole("CUSTOMER", "ADMIN")
                .requestMatchers("/api/orders/**").hasRole("ADMIN")
                .requestMatchers("/api/orders/all").hasRole("ADMIN")
                .requestMatchers("/api/users/leaderboard").hasAnyRole("CUSTOMER","ADMIN")
                .requestMatchers("/api/products/add", "/api/products/update/**", "/api/products/delete/**").hasRole("ADMIN")
                
                // Protected Endpoints
                .requestMatchers("/api/quiz/**", "/api/rewards/**").authenticated()
                .requestMatchers("/api/orders/**").authenticated()
               // .requestMatchers("/api/orders/user/**").authenticated()
                .requestMatchers("/api/users/profile/**").authenticated()
                .requestMatchers("/api/cart/**").authenticated()
                .requestMatchers("/api/rewards/**").authenticated()

               
               
                .anyRequest().authenticated()
            )
            // Add your custom JWT filter before the standard authentication filter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173")); // Allow Vite/React
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}