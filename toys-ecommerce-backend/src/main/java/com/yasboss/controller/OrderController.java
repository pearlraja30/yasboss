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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.dto.OrderRequestDTO;
import com.yasboss.dto.PaymentRequest;
import com.yasboss.model.Order;
import com.yasboss.repository.CouponRepository;
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

    @Autowired
    private CouponRepository couponRepository;

    // --- 🛒 CUSTOMER ENDPOINTS ---

    @PostMapping("/checkout")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequestDTO orderRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            log.info("Processing checkout for user: {}", email);
            Order savedOrder = orderService.placeOrder(orderRequest);
            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            log.error("Checkout failed: {}", e.getMessage());
            return ResponseEntity.status(500).body("Error processing order: " + e.getMessage());
        }
    }

    @GetMapping("/user/{email:.+}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable String email) {
        List<Order> orders = orderService.getOrdersByEmail(email);
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/{orderId}/request-replacement")
    public ResponseEntity<?> requestReplacement(@PathVariable Long orderId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            Order updatedOrder = orderService.requestReplacement(orderId, email);
            return ResponseEntity.ok(updatedOrder);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Replacement request failed.");
        }
    }

    /**
     * ✨ FIXED COUPON VALIDATION
     * Harmonized types to prevent "incompatible bounds" error.
     */
    @GetMapping("/coupons/validate/{code}")
    public ResponseEntity<?> validate(@PathVariable String code) {
        return couponRepository.findByCode(code)
            .filter(c -> !c.isExpired() && c.isActive())
            .map(coupon -> ResponseEntity.ok((Object) coupon))
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                                           .body("Invalid or Expired Coupon"));
    }

    @PostMapping("/process-payment")
    public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request) {
        Order order = orderRepository.findByOrderId(request.getOrderId())
            .orElseThrow(() -> new RuntimeException("Order Not Found"));

        if (!order.getTotalAmount().equals(request.getAmount())) {
            return ResponseEntity.badRequest().body("Amount Mismatch");
        }

        order.setStatus("PAID");
        orderRepository.save(order);

        userRepository.findByEmail(order.getUserEmail()).ifPresent(user -> {
            user.setRewardPoints(user.getRewardPoints() + (int)(order.getTotalAmount() / 100));
            userRepository.save(user);
        });

        return ResponseEntity.ok(Map.of("status", "SUCCESS"));
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

    // --- 🛠️ ADMIN ENDPOINTS ---

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/admin/replacements/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getPendingReplacements() {
        return ResponseEntity.ok(orderRepository.findByStatus("REPLACEMENT_REQUESTED"));
    }

    @PostMapping("/admin/{orderId}/replacement-action")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> handleReplacementAction(
            @PathVariable Long orderId, 
            @RequestParam String action) {
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if ("APPROVE".equalsIgnoreCase(action)) {
            order.setStatus("REPLACEMENT_APPROVED");
        } else {
            order.setStatus("REPLACEMENT_REJECTED");
        }
        
        orderRepository.save(order);
        return ResponseEntity.ok(Map.of("message", "Action " + action + " processed successfully."));
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> updateStatus(
        @PathVariable String orderId, 
        @RequestParam String status
    ) {
        Order order = orderRepository.findByOrderId(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @PutMapping("/{id}/delivered")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> delivered(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.markAsDelivered(id));
    }
}