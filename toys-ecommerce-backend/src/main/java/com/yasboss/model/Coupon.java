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
@Table(name = "coupons")
@Data
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code; // e.g., "TOY20"

    private String discountType; // "PERCENT" or "FLAT"
    private Double discountValue;
    private Double minOrderAmount;
    private LocalDateTime expiryDate;
    private boolean active;
    private Integer usageLimit;
    private Integer usedCount;
    
}