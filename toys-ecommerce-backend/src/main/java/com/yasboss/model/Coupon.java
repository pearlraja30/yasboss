package com.yasboss.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
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

    private int discountPercent;
    private double minOrderValue;
    private LocalDate expiryDate;
    
    private boolean active = true;

    // ✨ Added: Usage tracking to prevent abuse
    private Integer usageLimit; // null means unlimited
    private int usedCount = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        // ✨ Ensure code is always uppercase before saving
        if (this.code != null) {
            this.code = this.code.toUpperCase().trim();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (this.code != null) {
            this.code = this.code.toUpperCase().trim();
        }
    }

    // Helper to check validity
    public boolean isExpired() {
        return expiryDate != null && expiryDate.isBefore(LocalDate.now());
    }

    // ✨ Added: Check if usage limit is reached
    public boolean isLimitReached() {
        return usageLimit != null && usedCount >= usageLimit;
    }
}