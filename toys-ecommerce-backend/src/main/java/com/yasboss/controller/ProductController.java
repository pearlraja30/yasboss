package com.yasboss.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.yasboss.dto.ProductDetailDTO;
import com.yasboss.dto.ProductImageDTO;
import com.yasboss.model.Product;
import com.yasboss.service.ProductService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/products")
@Slf4j
public class ProductController {

    @Autowired
    private ProductService productService;
    
    // --- 🔍 SEARCH & FILTERING ---

    /**
     * Specialized filter for frontend Shop page.
     * Placed BEFORE /{id} to avoid path variable conflicts.
     */
    @GetMapping("/filter")
    public List<Product> getProducts(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String age,
        @RequestParam(required = false) String search
    ) {
        log.info("Filtering products with category: {}, age: {}, search: {}", category, age, search);
        return productService.getFilteredProducts(category, age, search);
    }

    @GetMapping("/features")
    public List<Product> getFeaturedProducts() {
        return productService.getFeaturedProducts();
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam("q") String query) {
        return productService.getProductsByNameFragment(query);
    }

    // --- 📦 PRODUCT RETRIEVAL ---

    @GetMapping("/all")
    public List<Product> getAll() {
        return productService.getAllProducts();
    }

    /**
     * ✨ FIX: Delegate mapping to Service layer.
     * This ensures the DTO (with 4-arg constructor) is built correctly.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailDTO> getProductById(@PathVariable Long id) {
        log.info("Fetching details for Product ID: {}", id);
        try {
            ProductDetailDTO dto = productService.getProductById(id);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Product not found: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/category/{categoryName}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String categoryName) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryName));
    }

    @GetMapping("/age/{ageRange}")
    public List<Product> getProductsByAge(@PathVariable String ageRange) {
        return productService.getFindByAgeRangeIgnoreCase(ageRange);
    }

    // --- 🛠️ ADMIN & STOCK MANAGEMENT ---

    @PostMapping("/add")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        Product savedProduct = productService.saveProduct(product);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product details) {
        return productService.findById(id).map(product -> {
            product.setName(details.getName());
            product.setPrice(details.getPrice()); // Standardized field naming
            product.setDetailedDescription(details.getDetailedDescription());
            product.setStockQuantity(details.getStockQuantity());
            product.setCategory(details.getCategory());
            return ResponseEntity.ok(productService.saveProduct(product));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/360")
    public ResponseEntity<List<ProductImageDTO>> get360View(@PathVariable Long id) {
        return ResponseEntity.ok(productService.get360Gallery(id));
    }
}