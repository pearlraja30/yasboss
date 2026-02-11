package com.yasboss.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.yasboss.model.Article;
import com.yasboss.repository.ArticleRepository;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;

    public ArticleService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    public List<Article> getArticlesByCategory(String categorySlug) {
        return articleRepository.findByCategorySlug(categorySlug);
    }

    public List<Article> getFeaturedArticles() {
        return articleRepository.findByFeaturedTrue();
    }

    public Article getArticleBySlug(String slug) {
        return articleRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Article not found"));
    }

    public Article saveArticle(Article article) {
        return articleRepository.save(article);
    }

    public List<Article> findByAgeCategory(String ageCategory) {

        return articleRepository.findByCategorySlug(ageCategory);
    }

    public void deleteById(Long id) {
        articleRepository.deleteById(id);
    }

    public List<Article> getAllArticles() {
        return articleRepository.findAll();
    }

    public Article getArticle(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));
    }

    public void deleteArticle(Long id) {
        articleRepository.deleteById(id);
    }

    public Article updateArticle(Article article) {
        return articleRepository.save(article);
 
   }

   public Optional<Article> findBySlug(String slug) {
    
    return articleRepository.findBySlug(slug);
}
}