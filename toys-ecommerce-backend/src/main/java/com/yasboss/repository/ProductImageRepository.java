package com.yasboss.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.yasboss.model.ProductImage;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    /**
     * ✨ Query only 360-degree images for a specific toy.
     * Matches the 'is360View' boolean in your ProductImage entity.
     */
    List<ProductImage> findByProductIdAndIs360ViewTrue(Long productId);

    /**
     * ✨ Query only standard gallery images (Zoom view).
     */
    List<ProductImage> findByProductIdAndIs360ViewFalse(Long productId);
}