package com.yasboss.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "coupons")
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code; // e.g., "TOY20"

    private Integer discountPercent; // e.g., 20
    private BigDecimal minCartValue; // Requirement #7
    private LocalDate expiryDate;
    private Boolean isActive = true;

    // Standard Getters and Setters
}