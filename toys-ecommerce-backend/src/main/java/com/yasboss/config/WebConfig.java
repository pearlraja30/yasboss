package com.yasboss.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // This makes 'public/images/' folder in your project root accessible via /images/**
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:public/images/", "classpath:/static/images/");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                // ✨ You MUST explicitly allow the Authorization header
                .allowedHeaders("Authorization", "Content-Type") 
                .allowCredentials(true);
    }
}