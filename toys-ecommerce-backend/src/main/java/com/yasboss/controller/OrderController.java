package com.yasboss.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.model.Order;
import com.yasboss.repository.OrderRepository;
import com.yasboss.repository.UserRepository;
import com.yasboss.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173") 
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all orders for a specific user.
     * Used by the "My Orders" page in React.
     */
    @GetMapping("/user/{email}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable String email) {
        // Ensure the repository method matches the field name in your Order entity
        List<Order> orders = orderRepository.findByUserEmailOrderByCreatedAtDesc(email);
        return ResponseEntity.ok(orders);
    }

    /**
     * Admin only: Get all orders for the dashboard.
     */
    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        // Fetches all orders from the database, newest first
        return ResponseEntity.ok(orderRepository.findAllByOrderByCreatedAtDesc());
    }

    /**
     * Admin only: Update order status.
     * Receives the 'YB-XXXX' string orderId.
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<Order> updateStatus(
        @PathVariable String orderId, 
        @RequestParam String status
    ) {
        // Lookup by the custom String orderId used in the frontend
        Order order = orderRepository.findByOrderId(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with reference: " + orderId));
        
        order.setStatus(status);
        return ResponseEntity.ok(orderRepository.save(order));
    }
    
    @GetMapping("/my-tracking")
    public ResponseEntity<?> getMyTracking() {
        // 1. Identify user via JWT
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // 2. Get the phone number from the User profile
        return userRepository.findByEmail(email)
            .map(user -> {
                if (user.getPhone() == null) {
                    return ResponseEntity.badRequest().body("No mobile number linked to account.");
                }
                // 3. Fetch orders using the phone number
                List<Order> orders = orderService.getOrdersByPhone(user.getPhone());
                return ResponseEntity.ok(orders);
            })
            .orElse(ResponseEntity.status(404).body("User not found"));
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> createOrder(@RequestBody Order order) {
        // Extract identity from JWT
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        try {
            Order savedOrder = orderService.placeOrder(order, email);
            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing order: " + e.getMessage());
        }
    }

    @PostMapping("/instant")
    public ResponseEntity<?> processInstantOrder(
            @RequestHeader("X-User-Email") String email,
            @RequestBody Map<String, Object> orderData) {
        
        // Logic to create a pending order directly from the productId
        Order pendingOrder = orderService.createPendingOrder(
            email, 
            Long.valueOf(orderData.get("productId").toString()), 
            (Integer) orderData.get("quantity")
        );
        
        return ResponseEntity.ok(pendingOrder);
    }
}