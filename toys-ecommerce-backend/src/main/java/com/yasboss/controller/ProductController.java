package com.yasboss.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.yasboss.model.Product;
import com.yasboss.service.ProductService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/products")
@Slf4j
public class ProductController {

    @Autowired
    private ProductService productService;

    // ✨ UPDATED: Explicitly named /filter to match frontend api.ts call
    // This MUST stay above the /{id} mapping to avoid type mismatch errors
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

    @GetMapping("/all")
    public List<Product> getAll() {
        return productService.getAllProducts();
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam("q") String query) {
        return productService.findByNameContainingIgnoreCase(query);
    }

    @GetMapping("/category/{categoryName}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String categoryName) {
        log.info("Fetching products for category: {}", categoryName);
        List<Product> products = productService.getProductsByCategory(categoryName);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/age/{ageRange}")
    public List<Product> getProductsByAge(@PathVariable String ageRange) {
        log.info("Fetching products for age range: {}", ageRange);
        return productService.findByAgeRangeIgnoreCase(ageRange);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStockItems(@RequestParam(defaultValue = "5") int threshold) {
        List<Product> lowStock = productService.findByStockLessThan(threshold);
        return ResponseEntity.ok(lowStock);
    }

    // 🔒 MOVED: Dynamic ID paths must be at the bottom
    // This prevents "filter" or "all" from being treated as a numeric ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    } 

    @PostMapping("/add")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        Product savedProduct = productService.saveProduct(product);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product details) {
        return productService.findById(id).map(product -> {
            product.setName(details.getName());
            product.setMrpPrice(details.getMrpPrice());
            product.setSellingPrice(details.getSellingPrice());
            product.setDetailedDescription(details.getDetailedDescription());
            product.setStock(details.getStock());
            product.setCategory(details.getCategory());
            return ResponseEntity.ok(productService.save(product));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get("target/classes/static/uploads/"); 
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
            Files.copy(file.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            return ResponseEntity.ok(Map.of("url", "http://localhost:8080/uploads/" + fileName));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Upload failed"));
        }
    }
}