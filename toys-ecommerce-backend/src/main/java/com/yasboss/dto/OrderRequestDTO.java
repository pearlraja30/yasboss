package com.yasboss.dto;

import java.util.List;

import lombok.Data;

@Data
public class OrderRequestDTO {
    // Basic Customer Info
    private String email;
    private String shippingAddress;
    private String customerNotes;
    private String paymentMethod;

    // ✨ Coupon & Points Logic
    private String couponCode;
    private Integer pointsUsed;

    // 🛒 The Cart Items
    private List<OrderItemRequest> items;

    /**
     * Nested DTO for individual items in the order
     */
    @Data
    public static class OrderItemRequest {
        private Long productId;
        private String productName;
        private Double price;
        private Integer quantity;
    }
}