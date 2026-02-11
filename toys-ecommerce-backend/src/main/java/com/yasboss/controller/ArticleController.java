package com.yasboss.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.model.Article;
import com.yasboss.service.ArticleService;

@RestController
@RequestMapping("/api/parenting/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping("/featured")
    public List<Article> getFeatured() {
        return articleService.getFeaturedArticles();
    }

    @GetMapping("/category/{slug}")
    public List<Article> getByCategory(@PathVariable String slug) {
        return articleService.getArticlesByCategory(slug);
    }

    @PostMapping
    public ResponseEntity<Article> createArticle(@RequestBody Article article) {
        // Logic: Ensure the author is set to the logged-in admin
        article.setAuthor("Admin Team");
        Article saved = articleService.saveArticle(article);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable Long id) {
        articleService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Article> getArticleBySlug(@PathVariable String slug) {
        return articleService.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}