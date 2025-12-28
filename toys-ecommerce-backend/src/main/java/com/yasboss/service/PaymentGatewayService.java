package com.yasboss.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.yasboss.dto.OrderRequest;

@Service
public class PaymentGatewayService {

    public boolean processPayment(OrderRequest request, double amount) {
        // Logic to connect to Razorpay/Stripe API would go here
        
        if ("COD".equalsIgnoreCase(request.getPaymentMethod())) {
            return true; // Cash on delivery is always "processed" at this stage
        }

        // Simulate a successful payment for CARD/UPI
        System.out.println("Processing " + request.getPaymentMethod() + " payment for ₹" + amount);
        return true; 
    }

    public String generateTransactionId() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}