package com.yasboss.service;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yasboss.model.QuizQuestion;
import com.yasboss.repository.QuizQuestionRepository;

@Service
public class QuizService {

    @Autowired
    private QuizQuestionRepository questionRepo;

    /**
     * Requirement #5: Fetch questions by category
     * We shuffle the list so children get a different experience each time.
     */
    public List<QuizQuestion> getQuestionsByCategory(String category) {
        List<QuizQuestion> questions = questionRepo.findByCategory(category);
        
        // Randomize the order of questions for gamification
        Collections.shuffle(questions);
        
        // Return a limited set (e.g., top 10) to keep the quiz quick
        return questions.size() > 10 ? questions.subList(0, 10) : questions;
    }
}