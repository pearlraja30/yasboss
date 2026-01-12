package com.yasboss.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

   @Value("${file.upload-dir}")
    private String uploadRoot;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
      
        
       String location = "file:" + uploadRoot + (uploadRoot.endsWith("/") ? "" : "/");

        registry.addResourceHandler("/images/**")
                .addResourceLocations(location)
                .setCachePeriod(3600); // Optional: Cache images for 1 hour

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");        
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                // ✨ You MUST explicitly allow the Authorization header
                .allowedHeaders("Authorization", "Content-Type", "X-User-Email", "Cache-Control", "Access-Control-Allow-Origin") 
                .allowCredentials(true);
    }
}