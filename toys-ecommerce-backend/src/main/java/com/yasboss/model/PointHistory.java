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
@Table(name = "point_history")
@Data
public class PointHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "points_changed")
    private Integer pointsChanged;

    @Column(name = "transaction_type")
    private String transactionType;

    private String description;
    
    @Column(name = "quiz_id")
    private String quizId;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}