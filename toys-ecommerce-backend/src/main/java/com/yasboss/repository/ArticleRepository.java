package com.yasboss.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.yasboss.model.Article;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    
    // Fetch articles for a specific age group (Toddler, Infant, etc.)
    List<Article> findByCategorySlug(String categorySlug);

    // Fetch featured articles for the Hub hero section
    List<Article> findByFeaturedTrue();

    // Find a single article by its slug
    Optional<Article> findBySlug(String slug);
    
}