package com.yasboss.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.dto.OrderRequest;
import com.yasboss.service.CheckoutService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // Required for React integration
public class CheckoutController {

    private final CheckoutService checkoutService;

    /**
     * POST /api/checkout/place-order
     * Receives the order data from the React frontend and processes the transaction.
     */
    @PostMapping("/place-order")
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest orderRequest) {
        try {
            // We use the email directly from the request object as discussed
            if (orderRequest.getUserEmail() == null || orderRequest.getUserEmail().isEmpty()) {
                return ResponseEntity.badRequest().body("User email is required for checkout.");
            }

            // Process the checkout and get the generated YB- Order ID
            String orderId = checkoutService.processCheckout(orderRequest);
            
            // Return the Order ID string so React can show the Success page
            return ResponseEntity.ok(orderId);
            
        } catch (Exception e) {
            // Log the error and return a 500 status to the frontend
            return ResponseEntity.internalServerError().body("Checkout failed: " + e.getMessage());
        }
    }
}