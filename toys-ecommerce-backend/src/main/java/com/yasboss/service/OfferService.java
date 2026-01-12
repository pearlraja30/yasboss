package com.yasboss.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yasboss.model.Product;
import com.yasboss.repository.CouponRepository;
import com.yasboss.repository.ProductRepository;

@Service
public class OfferService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CouponRepository couponRepository;

    /**
     * ✨ Apply Seasonal Discount to ALL Products
     */
    @Transactional
    @CacheEvict(value = {"productDetails", "featuredProducts"}, allEntries = true)
    public void applyGlobalDiscount(Double percentage) {
        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            // Store original price if not already stored
            if (p.getOriginalPrice() == null) {
                p.setOriginalPrice(p.getPrice());
            }
            double discountedPrice = p.getOriginalPrice() * (1 - (percentage / 100));
            p.setPrice(discountedPrice);
            p.setDiscountPercent(percentage);
        }
        productRepository.saveAll(products);
    }

    /**
     * 🛠️ Reset all prices to original
     */
    @Transactional
    @CacheEvict(value = {"productDetails", "featuredProducts"}, allEntries = true)
    public void resetGlobalDiscounts() {
        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            if (p.getOriginalPrice() != null) {
                p.setPrice(p.getOriginalPrice());
                p.setDiscountPercent(0.0);
            }
        }
        productRepository.saveAll(products);
    }
}
