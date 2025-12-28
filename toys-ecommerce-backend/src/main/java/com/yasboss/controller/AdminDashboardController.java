package com.yasboss.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.model.Product;
import com.yasboss.repository.OrderRepository;
import com.yasboss.repository.ProductRepository;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // Restrict to Admin only
public class AdminDashboardController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getAdminSummary() {
       Map<String, Object> stats = new HashMap<>();
    
        // Updated method calls
        stats.put("totalProducts", productRepository.count());
        stats.put("lowStockCount", productRepository.countByStockLessThan(10)); 
        
        Double revenue = orderRepository.getTotalRevenue();
        stats.put("totalRevenue", revenue != null ? revenue : 0.0);
        
        stats.put("pendingOrders", orderRepository.countByStatus("PENDING"));
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", orderRepository.count());
        stats.put("totalRevenue", orderRepository.getTotalRevenue());
        stats.put("lowStockCount", productRepository.countByStockLessThan(10));
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/low-stock-items")
    public ResponseEntity<List<Product>> getLowStockItems() {
        // Fetches items where stock < 5 for critical alerts
        List<Product> lowStockToys = productRepository.findByStockLessThan(5);
        return ResponseEntity.ok(lowStockToys);
    }
}