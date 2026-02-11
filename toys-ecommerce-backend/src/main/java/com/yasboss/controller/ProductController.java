package com.yasboss.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.yasboss.dto.ProductDetailDTO;
import com.yasboss.dto.ProductImageDTO;
import com.yasboss.model.Product;
import com.yasboss.repository.CategoryRepository;
import com.yasboss.repository.ProductRepository;
import com.yasboss.service.ProductService;

import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/products")
@Slf4j
public class ProductController {

    @Autowired
    private ProductService productService;
    
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;
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

    /* 
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam("q") String query) {
        return productService.getProductsByNameFragment(query);
    }*/

    @GetMapping("/search")
    public List<Product> searchProducts(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String age,
        @RequestParam(required = false) String search
    ) {
        // Use a repository method that handles nulls
        return productRepository.findFilteredProducts(
            (category == null || category.isEmpty()) ? null : category,
            (age == null || age.isEmpty()) ? null : age,
            (search == null || search.isEmpty()) ? null : search
        );
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

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        return productRepository.findById(id).map(product -> {
            product.setName(productDetails.getName());
            product.setDetailedDescription(productDetails.getDetailedDescription());
            product.setPrice(productDetails.getPrice());
            product.setStockQuantity(productDetails.getStockQuantity());
            product.setImageUrl(productDetails.getImageUrl());

            // ✨ CRITICAL FIX: Re-attach the category from the DB
          /*   if (productDetails.getCategory() != null) {
                Category category = categoryRepository.findById(productDetails.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
                product.setCategory(category);
            } */

            return ResponseEntity.ok(productRepository.save(product));
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

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> addProduct(
        @RequestPart("product") String productJson,
        @RequestPart("image") MultipartFile imageFile
    ) throws IOException {
        // 1. Convert JSON string to Product Object
        ObjectMapper mapper = new ObjectMapper();
        Product product = mapper.readValue(productJson, Product.class);

        // 2. Save the File to a folder
        String uploadDir = "uploads/products/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + fileName);
        Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // 3. Set the generated URL path to the product
        product.setImageUrl("/uploads/products/" + fileName);

        return ResponseEntity.ok(productService.saveProduct(product));
    }
}