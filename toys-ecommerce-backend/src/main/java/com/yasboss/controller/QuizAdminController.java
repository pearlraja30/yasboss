package com.yasboss.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping; // If using security
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.model.QuizQuestion;
import com.yasboss.repository.QuizQuestionRepository;

@RestController
@RequestMapping("/api/admin/quiz")
public class QuizAdminController {

    @Autowired
    private QuizQuestionRepository quizRepository;

    // Requirement #7: List all questions for management
    @GetMapping("/all")
    public List<QuizQuestion> getAllQuestions() {
        return quizRepository.findAll();
    }

    // Requirement #7: Add a new question
    @PostMapping("/add")
    public QuizQuestion addQuestion(@RequestBody QuizQuestion question) {
        return quizRepository.save(question);
    }

    // Requirement #7: Update existing question
    @PutMapping("/update/{id}")
    public ResponseEntity<QuizQuestion> updateQuestion(@PathVariable Long id, @RequestBody QuizQuestion details) {
        return quizRepository.findById(id).map(question -> {
            question.setQuestionText(details.getQuestionText());
            question.setCategory(details.getCategory());
            question.setOption_a(details.getOption_a());
            question.setOption_b(details.getOption_b());
            question.setOption_c(details.getOption_c());
            question.setOption_d(details.getOption_d());
            question.setCorrectOption(details.getCorrectOption());
            question.setPoints(details.getPoints());
            return ResponseEntity.ok(quizRepository.save(question));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Requirement #7: Delete a question
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        quizRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}