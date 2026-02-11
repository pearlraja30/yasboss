package com.yasboss.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "articles")
@Data
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;

    private String author;
    private String imageUrl;
    
    // Slug for SEO-friendly URLs (e.g., "tips-for-newborn-sleep")
    private String slug;

    // Links the article to an age group (e.g., "infant", "toddler")
    private String categorySlug;

    private LocalDateTime createdAt = LocalDateTime.now();
    
    private boolean featured = false;
}