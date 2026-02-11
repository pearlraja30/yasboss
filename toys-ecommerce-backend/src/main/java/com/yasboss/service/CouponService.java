package com.yasboss.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yasboss.model.Coupon;
import com.yasboss.repository.CouponRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    /**
     * ✨ FIX: Added createCoupon method
     * This ensures your Controller finds the symbol it's looking for.
     */
    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        // Normalization is handled by @PrePersist in the Model, 
        // but we'll trim just to be safe.
        coupon.setCode(coupon.getCode().toUpperCase().trim());
        coupon.setUsedCount(0); 
        return couponRepository.save(coupon);
    }

    /**
     * 🛒 Validate and Calculate Discount
     */
    public Double validateAndCalculateDiscount(String code, Double orderAmount) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase().trim())
            .filter(c -> c.isActive() && !c.isExpired() && !c.isLimitReached())
            .orElseThrow(() -> new RuntimeException("Invalid, expired, or fully used coupon."));

        if (orderAmount < coupon.getMinOrderValue()) {
            throw new RuntimeException("Minimum order of ₹" + coupon.getMinOrderValue() + " required.");
        }

        double discount = orderAmount * (coupon.getDiscountPercent() / 100.0);
        return Math.min(discount, orderAmount);
    }

    // --- Admin Management Methods ---

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Transactional
    public Coupon saveCoupon(Coupon coupon) {
        return couponRepository.findByCode(coupon.getCode().toUpperCase().trim())
            .map(existing -> {
                existing.setDiscountPercent(coupon.getDiscountPercent());
                existing.setMinOrderValue(coupon.getMinOrderValue());
                existing.setExpiryDate(coupon.getExpiryDate());
                existing.setActive(coupon.isActive());
                existing.setUsageLimit(coupon.getUsageLimit());
                return couponRepository.save(existing);
            })
            .orElseGet(() -> createCoupon(coupon));
    }

    @Transactional
    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }

    // Inside CouponService.java

    @Transactional
    public void incrementUsage(String code) {
        if (code == null || code.isEmpty()) return;

        couponRepository.findByCode(code.toUpperCase().trim()).ifPresent(coupon -> {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            
            // Check if we hit the limit
            if (coupon.isLimitReached()) {
                coupon.setActive(false);
            }
            
            couponRepository.save(coupon);
            log.info("Coupon {} usage incremented. Current count: {}", code, coupon.getUsedCount());
        });
    }
}