package com.yasboss.controller;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import com.yasboss.repository.OrderRepository;

@RestController
@RequestMapping("/api/webhooks/shiprocket")
@Slf4j
public class ShipRocketWebhookController {

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/update-status")
    public ResponseEntity<?> handleShiprocketUpdate(@RequestBody Map<String, Object> payload) {
        try {
            // 1. Extract tracking details from Shiprocket JSON
            // Shiprocket typically sends 'awb', 'status', and 'order_id'
            String awbCode = (String) payload.get("awb");
            String newStatus = (String) payload.get("status");
            
            log.info("Webhook received: AWB {} is now {}", awbCode, newStatus);

            // 2. Find the order in our database using the AWB/Tracking ID
            orderRepository.findByTrackingId(awbCode).ifPresent(order -> {
                // 3. Map Shiprocket statuses to your local statuses
                String mappedStatus = mapShiprocketStatus(newStatus);
                order.setStatus(mappedStatus);
                orderRepository.save(order);
                log.info("Order {} status updated to {}", order.getOrderId(), mappedStatus);
            });

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Webhook processing failed", e);
            return ResponseEntity.status(500).build();
        }
    }

    private String mapShiprocketStatus(String srStatus) {
        return switch (srStatus.toLowerCase()) {
            case "shipped", "in transit" -> "SHIPPED";
            case "delivered" -> "DELIVERED";
            case "cancelled" -> "CANCELLED";
            case "out for delivery" -> "DISPATCHED";
            default -> "PENDING";
        };
    }
}