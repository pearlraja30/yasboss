package com.yasboss.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yasboss.exception.ResourceNotFoundException;
import com.yasboss.model.Coupon;
import com.yasboss.repository.CouponRepository;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    /**
     * 🛒 Validate and Calculate Discount
     * Used by the React frontend during checkout.
     */
    public Double validateAndCalculateDiscount(String code, Double orderAmount) {
        Coupon coupon = couponRepository.findValidCoupon(code.toUpperCase())
            .orElseThrow(() -> new ResourceNotFoundException("Invalid, expired, or exhausted coupon code."));

        // 1. Check Minimum Order Requirement
        if (orderAmount < coupon.getMinOrderAmount()) {
            throw new RuntimeException("Minimum order of ₹" + coupon.getMinOrderAmount() + " required for this code.");
        }

        // 2. Calculate Discount
        double discount = 0.0;
        if ("PERCENT".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = orderAmount * (coupon.getDiscountValue() / 100);
        } else {
            discount = coupon.getDiscountValue();
        }

        // Ensure discount doesn't exceed order amount
        return Math.min(discount, orderAmount);
    }

    /**
     * ✅ Finalize Coupon Usage
     * Called after a successful payment/order placement.
     */
    @Transactional
    public void incrementUsage(String code) {
        couponRepository.findByCodeIgnoreCase(code).ifPresent(coupon -> {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
                coupon.setActive(false); // Auto-disable if limit reached
            }
            couponRepository.save(coupon);
        });
    }

    // --- Admin Management Methods ---

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        coupon.setCode(coupon.getCode().toUpperCase());
        coupon.setUsedCount(0);
        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }
}