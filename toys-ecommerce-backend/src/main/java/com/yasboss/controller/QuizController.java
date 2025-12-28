package com.yasboss.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.model.QuizQuestion;
import com.yasboss.repository.UserRepository;
import com.yasboss.service.QuizService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:5173") 
@Slf4j
public class QuizController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizService quizService;

    /**
     * Requirement #5: Get questions by category
     * Removed the @RequestParam("email") because we use JWT now!
     */
    @GetMapping("/questions/{category}")
    public ResponseEntity<List<QuizQuestion>> getQuestions(@PathVariable String category) {
        // OPTIONAL: If you need the email for logging/logic, get it from the context
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("DEBUG: Fetching quiz for user: " + userEmail);

        List<QuizQuestion> questions = quizService.getQuestionsByCategory(category);
        return ResponseEntity.ok(questions);
    }

}