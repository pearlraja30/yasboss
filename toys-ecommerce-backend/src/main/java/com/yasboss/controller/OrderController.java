package com.yasboss.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.dto.PaymentRequest;
import com.yasboss.model.Order;
import com.yasboss.model.User;
import com.yasboss.repository.OrderRepository;
import com.yasboss.repository.UserRepository;
import com.yasboss.service.OrderService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/orders")
@Slf4j
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
    @GetMapping("/user/{email:.+}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable String email) {
        log.info("Fetching orders for user: {}", email);
        // Ensure the repository method matches the field name in your Order entity
        List<Order> orders = orderService.getOrdersByEmail(email);
        return ResponseEntity.ok(orders);
    }

    /**
     * Admin only: Get all orders for the dashboard.
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        // Fetches all orders from the database, newest first
        return ResponseEntity.ok(orderRepository.findAllByOrderByCreatedAtDesc());
    }

    /**
     * Admin only: Update order status.
     * Receives the 'YB-XXXX' string orderId.
     */
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> updateStatus(
        @PathVariable String orderId, 
        @RequestParam String status,
        @RequestParam(required = false) String agentName, // ✨ Matches new frontend field
        @RequestParam(required = false) String agentPhone // ✨ Matches new frontend field
    ) {
        Order order = orderRepository.findByOrderId(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        
        order.setStatus(status);
        
        // Update the logistical details
        if (agentName != null) order.setDeliveryAgentName(agentName);
        if (agentPhone != null) order.setDeliveryAgentPhone(agentPhone);
        
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

    @PostMapping("/process-payment")
    public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request) {
        // 1. Fetch Order from DB
        Order order = orderRepository.findByOrderId(request.getOrderId())
            .orElseThrow(() -> new RuntimeException("Order Not Found"));

        // 2. Validate Amount
        if (!order.getTotalAmount().equals(request.getAmount())) {
            return ResponseEntity.badRequest().body("Amount Mismatch");
        }

        // 3. Update Order Status
        order.setStatus("PAID");
        orderRepository.save(order);

        // 4. Update User Reward Points (Add 1 point per 100 spent)
        User user = userRepository.findByEmail(order.getUserEmail()).get();
        user.setRewardPoints(user.getRewardPoints() + (int)(order.getTotalAmount() / 100));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("status", "SUCCESS"));
    }

    @PutMapping("/{orderId}/logistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> updateLogistics(
        @PathVariable String orderId, 
        @RequestParam String status,
        @RequestParam String agentName,
        @RequestParam String agentPhone
    ) {
        Order order = orderRepository.findByOrderId(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        
        order.setStatus(status);
        order.setDeliveryAgentName(agentName);
        order.setDeliveryAgentPhone(agentPhone);
        
        // Add logic to set estimated delivery (e.g., current time + 2 days)
        order.setEstimatedDelivery(LocalDateTime.now().plusDays(2));
        
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @PutMapping("/{orderId}/agent-update")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Order> agentStatusUpdate(
        @PathVariable String orderId, 
        @RequestParam String status,
        @RequestParam(required = false) String deliveryNote
    ) {
        Order order = orderRepository.findByOrderId(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        
        // Security: Verify the agent is the one assigned to this order
        String currentAgentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        // (Optional: add logic to check if currentAgentEmail matches order.getDeliveryAgentEmail())
        
        order.setStatus(status);
        if (deliveryNote != null) {
            // Append note to customer history
            order.setCustomerNotes(order.getCustomerNotes() + " | Agent: " + deliveryNote);
        }
        
        return ResponseEntity.ok(orderRepository.save(order));
    }
}