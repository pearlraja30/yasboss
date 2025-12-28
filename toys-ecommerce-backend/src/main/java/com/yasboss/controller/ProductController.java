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
import org.springframework.web.bind.annotation.CrossOrigin;
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
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public List<Product> getProducts(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String age,
        @RequestParam(required = false) String search
    ) {
        log.info("Filtering products with category: {} and age: {} and searhc: {{}", category,  age, search);
        // Logic to filter products in DB based on category or age
        return productService.getFilteredProducts(category, age, search);
    }

    // Endpoint: GET /api/products/featured
    @GetMapping("/features")
    public List<Product> getFeaturedProducts() {
        return productService.getFeaturedProducts();
    }

    @GetMapping("/collection/{ageRoute}")
    public List<Product> getProductsByCollection(@PathVariable String ageRoute) {
        // 1. Convert the route slug (e.g., "0-2-years") back to the database format (e.g., "0 - 2 Years")
       log.info("Fetching products for age route: {}", ageRoute);
        String formattedAgeRange = ageRoute
                .replace("-years", " Years")
                .replace("-plus", "+")
                .replace('-', ' '); 
        
        // Handle the specific cases for the age ranges defined in the frontend mock:
        // "0-2-years" -> "0 - 2 Years"
        // "6-plus-years" -> "6 + Years"
        
        // 2. Query the repository
       log.info("After format age route: {}", formattedAgeRange);
        return productService.getFindByAgeRangeIgnoreCase(ageRoute);
    }


    // NEW Category Filter endpoint
    @GetMapping("/category/{categoryName}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String categoryName) {
        log.info("Fetching products for category: {}", categoryName);
        List<Product> products = productService.getProductsByCategory(categoryName);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/all")
    public List<Product> getAll() {
        // Returns the list of products as a JSON array
        return productService.getAllProducts();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    } 

    @GetMapping("/age/{ageRange}")
    public List<Product> getProductsByAge(@PathVariable String ageRange) {
        log.info("Fetching products for age range: {}", ageRange);
        return productService.findByAgeRangeIgnoreCase(ageRange);
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam("q") String query) {
        return productService.findByNameContainingIgnoreCase(query);
    }

    @PostMapping("/add")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        // This saves the product sent from your React Admin UI into PostgreSQL
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

    // Delete a toy from inventory
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // Define directory: src/main/resources/static/uploads/
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get("target/classes/static/uploads/"); 
            
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
            
            Files.copy(file.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            
            return ResponseEntity.ok(Map.of("url", "http://localhost:8080/uploads/" + fileName));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Upload failed"));
        }
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStockItems(@RequestParam(defaultValue = "5") int threshold) {
        // This naming matches your Repository method
        List<Product> lowStock = productService.findByStockLessThan(threshold);
        return ResponseEntity.ok(lowStock);
    }

}

