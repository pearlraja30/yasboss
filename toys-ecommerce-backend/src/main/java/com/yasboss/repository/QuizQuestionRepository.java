package com.yasboss.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.yasboss.model.QuizQuestion;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {

    /**
     * Requirement #5: Find questions by category (e.g., 'Educational', 'Logic')
     */
    List<QuizQuestion> findByCategory(String category);

    /**
     * Requirement #5: Fetch a randomized set of questions for a specific category
     * This uses a Native Query to leverage the database's random function (RAND() for MySQL/H2).
     */
    @Query(value = "SELECT * FROM quiz_questions WHERE category = :category ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<QuizQuestion> findRandomByCategory(@Param("category") String category, @Param("limit") int limit);
    
    /**
     * Find questions suitable for a specific age range
     */
    List<QuizQuestion> findByAgeRange(String ageRange);
}