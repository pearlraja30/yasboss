package com.yasboss.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.yasboss.model.Coupon;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    /**
     * ✨ Primary Validation Query
     * Finds a coupon that matches the code exactly.
     */
    Optional<Coupon> findByCodeIgnoreCase(String code);

    /**
     * 🔍 Active & Valid Lookup
     * Finds a coupon that is active, has not expired, and has usage remaining.
     * This is used during the checkout process.
     */
    @Query("SELECT c FROM Coupon c WHERE c.code = :code " +
           "AND c.active = true " +
           "AND c.expiryDate > CURRENT_TIMESTAMP " +
           "AND (c.usageLimit IS NULL OR c.usedCount < c.usageLimit)")
    Optional<Coupon> findValidCoupon(String code);

    /**
     * 📊 Admin Filter
     * Returns all active coupons for the dashboard.
     */
    List<Coupon> findByActiveTrueOrderByExpiryDateAsc();

    /**
     * 🗑️ Clean-up Helper
     * Finds all coupons that are past their expiry date.
     */
    List<Coupon> findByExpiryDateBefore(java.time.LocalDateTime now);

    Optional<Coupon> findByCode(String code);
}