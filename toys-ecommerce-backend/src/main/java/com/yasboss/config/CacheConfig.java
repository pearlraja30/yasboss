package com.yasboss.config;


import java.util.concurrent.TimeUnit;

import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.github.benmanes.caffeine.cache.Caffeine;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
       CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        
        // Define different cache "buckets"
        cacheManager.registerCustomCache("liveAnnouncements", 
            Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .maximumSize(50)
                .build());

        cacheManager.registerCustomCache("productDetails", 
            Caffeine.newBuilder()
                .expireAfterWrite(60, TimeUnit.MINUTES) // ⏱️ Products stay in cache for 1 hour
                .maximumSize(500) // 📦 Cache up to 500 unique products
                .build());
                
        return cacheManager;
    }

    // ✨ This defines the "Quiet Luxury" performance: 5 mins TTL, 100 max entries
    Caffeine<Object, Object> caffeineCacheBuilder() {
        return Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .maximumSize(100);
    }
}