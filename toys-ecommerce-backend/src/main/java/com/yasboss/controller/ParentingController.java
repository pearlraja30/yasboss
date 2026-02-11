package com.yasboss.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.model.Article;
import com.yasboss.model.ParentingAgeGroup;
import com.yasboss.service.ArticleService;
import com.yasboss.service.ParentingService;

@RestController
@RequestMapping("/api/parenting")
public class ParentingController {

    @Autowired
    private ParentingService parentingService;

    @Autowired
    private ArticleService articleService;


    @GetMapping("/age-groups")
    public ResponseEntity<List<ParentingAgeGroup>> getAgeGroups() {
       List<ParentingAgeGroup> groups = parentingService.findAllByOrderByMinAgeAsc();
    // Ensure this returns a List, even if empty
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/content/{ageSlug}")
    public List<Article> getContentForAge(@PathVariable String ageSlug) {
        // Fetches specific articles/tips based on the selected age
        return articleService.findByAgeCategory(ageSlug);
    }
}
