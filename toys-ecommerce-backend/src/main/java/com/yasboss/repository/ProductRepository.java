package com.yasboss.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yasboss.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Custom method to fetch products marked as featured
    List<Product> findByIsFeaturedTrue(); 

    List<Product> findByCategoryIgnoreCase(String category);

    List<Product> findByAgeRangeIgnoreCase(String ageRange);

    List<Product> findByNameContainingIgnoreCase(String nameFragment);

    Optional<Product> findById(Long id);

    List<Product> findByStockLessThanEqual(Integer threshold);

    long countByStockLessThan(int threshold);

    List<Product> findByStockLessThan(int threshold);

    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= p.lowStockThreshold")
    List<Product> findLowStockProducts();

   @Query("SELECT p FROM Product p WHERE " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:age IS NULL OR p.ageRange = :age) AND " +
           "(:search IS NULL OR LOWER(CAST(p.name AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    List<Product> findFilteredProducts(
        @Param("category") String category, 
        @Param("age") String age, 
        @Param("search") String search
    );
}