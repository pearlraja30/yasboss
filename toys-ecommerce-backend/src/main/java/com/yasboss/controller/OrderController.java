package com.yasboss.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping; // ✨ Import the new DTO
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.dto.OrderRequestDTO;
import com.yasboss.dto.PaymentRequest;
import com.yasboss.model.Order;
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

    // --- 🛒 CUSTOMER ENDPOINTS ---

    /**
     * ✨ REFINED CHECKOUT ENDPOINT
     * Uses OrderRequestDTO to capture coupons, points, and delivery notes.
     */
    @PostMapping("/checkout")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequestDTO orderRequest) {
        // Extract identity from JWT for security
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        try {
            log.info("Processing checkout for user: {} with Coupon: {}", email, orderRequest.getCouponCode());
            
            // Pass the DTO to the service layer for logic processing
            Order savedOrder = orderService.placeOrder(orderRequest);
            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            log.error("Checkout failed: {}", e.getMessage());
            return ResponseEntity.status(500).body("Error processing order: " + e.getMessage());
        }
    }

    /**
     * Get all orders for a specific user.
     */
    @GetMapping("/user/{email:.+}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable String email) {
        log.info("Fetching orders for user: {}", email);
        List<Order> orders = orderService.getOrdersByEmail(email);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/my-tracking")
    public ResponseEntity<?> getMyTracking() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .map(user -> {
                if (user.getPhone() == null) {
                    return ResponseEntity.badRequest().body("No mobile number linked to account.");
                }
                List<Order> orders = orderService.getOrdersByPhone(user.getPhone());
                return ResponseEntity.ok(orders);
            })
            .orElse(ResponseEntity.status(404).body("User not found"));
    }

    // --- 💳 PAYMENT & INSTANT PURCHASE ---

    @PostMapping("/process-payment")
    public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request) {
        Order order = orderRepository.findByOrderId(request.getOrderId())
            .orElseThrow(() -> new RuntimeException("Order Not Found"));

        if (!order.getTotalAmount().equals(request.getAmount())) {
            return ResponseEntity.badRequest().body("Amount Mismatch");
        }

        order.setStatus("PAID");
        orderRepository.save(order);

        // Loyalty Logic: Add points for the purchase
        userRepository.findByEmail(order.getUserEmail()).ifPresent(user -> {
            user.setRewardPoints(user.getRewardPoints() + (int)(order.getTotalAmount() / 100));
            userRepository.save(user);
        });

        return ResponseEntity.ok(Map.of("status", "SUCCESS"));
    }

    @PostMapping("/instant")
    public ResponseEntity<?> processInstantOrder(
            @RequestHeader("X-User-Email") String email,
            @RequestBody Map<String, Object> orderData) {
        
        Order pendingOrder = orderService.createPendingOrder(
            email, 
            Long.valueOf(orderData.get("productId").toString()), 
            (Integer) orderData.get("quantity")
        );
        return ResponseEntity.ok(pendingOrder);
    }

    // --- 🛠️ ADMIN & AGENT ENDPOINTS ---

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAllByOrderByCreatedAtDesc());
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> updateStatus(
        @PathVariable String orderId, 
        @RequestParam String status,
        @RequestParam(required = false) String agentName,
        @RequestParam(required = false) String agentPhone
    ) {
        Order order = orderRepository.findByOrderId(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        
        order.setStatus(status);
        if (agentName != null) order.setDeliveryAgentName(agentName);
        if (agentPhone != null) order.setDeliveryAgentPhone(agentPhone);
        
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
        
        order.setStatus(status);
        if (deliveryNote != null) {
            order.setCustomerNotes(order.getCustomerNotes() + " | Agent: " + deliveryNote);
        }
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @PostMapping("/{orderId}/support")
    public ResponseEntity<?> requestOrderSupport(
            @PathVariable String orderId,
            @RequestParam String type) {
        try {
            Order updatedOrder = orderService.processSupportRequest(orderId, type);
            return ResponseEntity.ok(updatedOrder);
        } catch (IllegalStateException e) {
            // Handle case where order isn't DELIVERED yet
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Request failed.");
        }
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            Order cancelledOrder = orderService.cancelOrder(orderId, email);
            return ResponseEntity.ok(cancelledOrder);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/out-for-delivery")
    public ResponseEntity<Order> outForDelivery(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.markAsOutForDelivery(id));
    }

    @PutMapping("/{id}/delivered")
    public ResponseEntity<Order> delivered(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.markAsDelivered(id));
    }
}