package com.yasboss.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
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
import com.yasboss.security.oauth2.CustomOAuth2UserService;
import com.yasboss.security.oauth2.OAuth2AuthenticationSuccessHandler;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    // Use constructor injection for all required components
    public SecurityConfig(
            JwtAuthenticationFilter jwtFilter, 
            CustomOAuth2UserService customOAuth2UserService,
            OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler) {
        this.jwtFilter = jwtFilter;
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2AuthenticationSuccessHandler = oAuth2AuthenticationSuccessHandler;
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
            .csrf(csrf -> csrf.disable()) 
            .cors(Customizer.withDefaults()) 
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) 
            .authorizeHttpRequests(auth -> auth
                // Public Endpoints
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**", "/oauth2/**", "/login/**").permitAll() // Added OAuth2 paths
                .requestMatchers("/api/categories/**").permitAll()
                .requestMatchers("/api/products/filter/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers("/uploads/**", "/images/**", "/static/**").permitAll()
                .requestMatchers("/process-payment").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/announcements/active").permitAll()
                .requestMatchers("/api/webhooks/shiprocket/**").permitAll()

                // Admin Endpoints
                .requestMatchers("/api/announcements/**").hasRole("ADMIN")
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
                .requestMatchers("/api/users/profile/**").authenticated()
                .requestMatchers("/api/cart/**").authenticated()
                .anyRequest().authenticated()
            )
            
            // --- ✨ OAUTH2 CONFIGURATION ---
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService) // Saves user to DB
                )
                .successHandler(oAuth2AuthenticationSuccessHandler) // Redirects to React with JWT
            )
            
            // JWT filter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173")); 
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}