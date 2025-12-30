package com.yasboss.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private String orderId;
    private Double amount;
    private String paymentMethod;
    private String status;
    // Getters and Setters
}