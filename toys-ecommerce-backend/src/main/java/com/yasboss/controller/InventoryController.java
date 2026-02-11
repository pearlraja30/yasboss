package com.yasboss.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.model.Product;
import com.yasboss.repository.ProductRepository;

@RestController
@RequestMapping("/api/admin/inventory")
public class InventoryController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/all")
    public List<Product> getAllInventory() {
        return productRepository.findAll();
    }

    @GetMapping("/alerts")
    public List<Product> getLowStockAlerts() {
        return productRepository.findLowStockProducts();
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateInventoryItem(@PathVariable Long id, @RequestBody Product productDetails) {
        return productRepository.findById(id).map(product -> {
            // Update the fields present in your payload
            product.setName(productDetails.getName());
            product.setPrice(productDetails.getPrice());
            product.setStockQuantity(productDetails.getStockQuantity());
            product.setAgeRange(productDetails.getAgeRange());
            
            // Handle the "Featured" mismatch (isFeatured vs featured)
            product.setIsFeatured(productDetails.getIsFeatured());

            Product updatedProduct = productRepository.save(product);
            return ResponseEntity.ok(updatedProduct);
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * ✨ NEW: Quick Stock Update (For "Add Stock" buttons)
     */
    @PatchMapping("/stock/{id}")
    public ResponseEntity<?> updateStockOnly(@PathVariable Long id, @RequestBody Map<String, Integer> updates) {
        return productRepository.findById(id).map(product -> {
            product.setStockQuantity(updates.get("stockQuantity"));
            productRepository.save(product);
            return ResponseEntity.ok(product);
        }).orElse(ResponseEntity.notFound().build());
    }
}
