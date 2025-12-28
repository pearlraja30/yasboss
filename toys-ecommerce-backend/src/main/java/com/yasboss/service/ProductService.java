package com.yasboss.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yasboss.model.Product;
import com.yasboss.repository.ProductRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrue();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public List<Product> getFindByAgeRangeIgnoreCase(String ageRange) {
        return productRepository.findByAgeRangeIgnoreCase(ageRange);
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryIgnoreCase(category);
    }

    public List<Product> getProductsByNameFragment(String nameFragment) {
        return productRepository.findByNameContainingIgnoreCase(nameFragment);
    }

    public List<Product> getProductsByCategoryName(String categoryName) {
        return productRepository.findByCategoryIgnoreCase(categoryName);
    }
    
    public Optional<Product> findById(Long id) {
        return productRepository.findById(id); // Uses JpaRepository's built-in findById
    }

    public List<Product>  findByAgeRangeIgnoreCase(String ageRange){
        return productRepository.findByAgeRangeIgnoreCase(ageRange);
    }

    public List<Product> findByNameContainingIgnoreCase(String nameFragment){
        return productRepository.findByNameContainingIgnoreCase(nameFragment);
    }

    public Product save(Product product) {
        // JPA's save() will either INSERT a new row or UPDATE an existing one
        return productRepository.save(product); 
    }

    public List<Product> findByStockLessThanEqual(Integer threshold) {
        return productRepository.findByStockLessThanEqual(threshold);
    }

    public long countByStockLessThan(int threshold) {
        return productRepository.countByStockLessThan(threshold);
    }

    public List<Product> findByStockLessThan(int threshold) {
        return productRepository.findByStockLessThan(threshold);
    }

    public List<Product> getFilteredProducts(String category, String age, String search) {
    // Convert empty strings to null so the ':param IS NULL' logic triggers correctly
       String categoryParam = (category != null && !category.trim().isEmpty()) ? category : null;
        String ageParam = (age != null && !age.trim().isEmpty()) ? age : null;
    
        // Explicitly trim and ensure search is null if empty
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        log.info("Executing query with Category: {}, Age: {}, Search: {}", categoryParam, ageParam, searchParam);
        
        return productRepository.findFilteredProducts(categoryParam, ageParam, searchParam);    
    }
}