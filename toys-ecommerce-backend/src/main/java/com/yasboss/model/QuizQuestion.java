package com.yasboss.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * POJO for Dynamic Quiz Questions.
 * Aligned with Requirement #5: Gamified Learning & Age-based categories.
 */
@Entity
@Table(name = "quiz_questions")
@Data // Generates getters, setters, toString, and equals/hashCode via Lombok
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The category of the quiz (e.g., 'Educational', 'Logic').
     */
    @Column(nullable = false)
    private String category;

    /**
     * Target age group for the question (e.g., '3-5', '6-8').
     */
    private String ageRange;

    /**
     * The actual question text to display.
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    // Option fields for the multiple-choice interface
    @Column(nullable = false)
    private String option_a;

    @Column(nullable = false)
    private String option_b;

    @Column(nullable = false)
    private String option_c;

    @Column(nullable = false)
    private String option_d;

    /**
     * Index of the correct answer (0=A, 1=B, 2=C, 3=D).
     */
    @Column(nullable = false)
    private int correctOption;

    /**
     * Reward points granted for a correct answer.
     */
    @Column(columnDefinition = "int default 10")
    private int points = 10;
}