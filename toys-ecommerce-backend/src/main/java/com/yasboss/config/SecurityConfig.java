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
            // Change to allow temporary sessions for OAuth2 handshake state, 
            // but your JWT filter will still handle API statelessness.
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)) 
            .authorizeHttpRequests(auth -> auth
                // Public Endpoints
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**", "/oauth2/**", "/login/**").permitAll() 
                .requestMatchers("/api/categories/**").permitAll()
                .requestMatchers("/api/products/filter/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers("/uploads/**", "/images/**", "/static/**").permitAll()
                .requestMatchers("/process-payment").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/announcements/active").permitAll()
                .requestMatchers("/api/webhooks/shiprocket/**").permitAll()
                
                // Parenting Hub Public Routes
                .requestMatchers(HttpMethod.GET, "/api/parenting/articles/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/parenting/age-groups").permitAll()

                // Admin Endpoints
                .requestMatchers("/api/announcements/**").hasRole("ADMIN")
                .requestMatchers("/api/users/leaderboard").hasAnyRole("CUSTOMER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/products").hasRole("ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/parenting/articles").hasRole("ADMIN") // POST/PUT articles
                .requestMatchers("/api/products/**").hasRole("ADMIN")
                .requestMatchers("/api/orders/user/**").hasAnyRole("CUSTOMER", "USER","ADMIN")
                .requestMatchers("/api/orders/**").hasRole("ADMIN")
                .requestMatchers("/api/orders/all").hasRole("ADMIN")
                .requestMatchers("/api/users/leaderboard").hasAnyRole("USER","CUSTOMER","ADMIN")
                
                // Protected Endpoints
                .requestMatchers("/api/quiz/**", "/api/rewards/**").authenticated()
                .requestMatchers("/api/parenting/milestones/**").authenticated() // Protect Milestones
                .requestMatchers("/api/users/profile/**").authenticated()
                .requestMatchers("/api/cart/**").authenticated()
                .anyRequest().authenticated()
            )
            
            // --- ✨ REFINED OAUTH2 CONFIGURATION ---
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService) // ✨ Connects the User saving logic
                )
                .successHandler(oAuth2AuthenticationSuccessHandler) 
                .redirectionEndpoint(redirection -> redirection
                    .baseUri("/login/oauth2/code/*")
                )
            )
            
            // JWT filter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Ensure this matches your Vite/React port
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173")); 
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}