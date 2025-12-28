package com.yasboss.dto;

import java.util.List;

import com.yasboss.model.CartItem;

import lombok.Data;

@Data
public class OrderRequest {
    private String userEmail;
    private Double totalAmount;
    private String shippingAddress;
    private String paymentMethod;
    private List<CartItem> items;
}