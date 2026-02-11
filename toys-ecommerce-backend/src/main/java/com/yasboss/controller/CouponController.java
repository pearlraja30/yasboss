package com.yasboss.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.model.Coupon;
import com.yasboss.repository.CouponRepository;
import com.yasboss.service.CouponService;

@RestController
@RequestMapping("/api")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @Autowired
    private CouponRepository couponRepository;

    // --- 🛒 PUBLIC ENDPOINTS (Checkout) ---

    /**
     * ✨ Validate Coupon at Checkout
     * GET /api/coupons/validate?code=HOLIDAY20&total=1500
     * Returns the discount amount as a Double.
     */
    @GetMapping("/coupons/validate")
    public ResponseEntity<Double> validateCoupon(
            @RequestParam String code, 
            @RequestParam Double total) {
        
        Double discountAmount = couponService.validateAndCalculateDiscount(code, total);
        return ResponseEntity.ok(discountAmount);
    }

    // --- 🛠️ ADMIN ENDPOINTS (Management) ---

    /**
     * Fetch all coupons for the Admin Dashboard
     */
    @GetMapping("/admin/coupons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    /**
     * Create a new seasonal coupon
     */
    @PostMapping("/admin/coupons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponService.createCoupon(coupon));
    }

    /**
     * Delete a coupon permanently
     */
    @DeleteMapping("/admin/coupons/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Coupon> saveCoupon(@RequestBody Coupon coupon) {
        // If coupon code exists, update it; otherwise, create new
        return couponRepository.findByCode(coupon.getCode())
            .map(existing -> {
                existing.setDiscountPercent(coupon.getDiscountPercent());
                existing.setExpiryDate(coupon.getExpiryDate());
                existing.setMinOrderValue(coupon.getMinOrderValue());
                return ResponseEntity.ok(couponRepository.save(existing));
            })
            .orElseGet(() -> ResponseEntity.ok(couponRepository.save(coupon)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        couponRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}