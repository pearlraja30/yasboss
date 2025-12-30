package com.yasboss.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.model.Order;
import com.yasboss.repository.OrderRepository;
import com.yasboss.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;

    /**
     * Admin View: Returns every order in the system, newest first.
     */
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        // Fetching through repository directly for efficiency in the dashboard
        return ResponseEntity.ok(orderRepository.findAllByOrderByCreatedAtDesc());
    }

    /**
     * Admin Status Update: Notifies the buyer by changing the progress state.
     * Fixed: Changed PathVariable to String to support "YB-XXXX" references.
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId, 
            @RequestBody Map<String, String> payload) {
        
        String newStatus = payload.get("status");
        
        return orderRepository.findById(orderId)
            .map(order -> {
                order.setStatus(newStatus);
                orderRepository.save(order);
                // This update will immediately reflect on the user's tracker
                return ResponseEntity.ok("Order status updated to " + newStatus);
            })
            .orElse(ResponseEntity.notFound().build());
    }
}