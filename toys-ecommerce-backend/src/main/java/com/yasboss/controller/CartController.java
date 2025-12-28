package com.yasboss.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.model.Cart;
import com.yasboss.service.CartService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(
    origins = "http://localhost:5173", 
    allowedHeaders = {"Authorization", "Content-Type", "X-User-Email"}, // ✨ ALLOW CUSTOM HEADER
    allowCredentials = "true"
)
@RequiredArgsConstructor
@Slf4j
public class CartController {

    private final CartService cartService;


    @PostMapping("/add/{productId}")
    public ResponseEntity<?> addToCart(
            @PathVariable Long productId,
            @RequestHeader("X-User-Email") String email,
            @RequestBody Map<String, Integer> body) {
        
                log.info("Adding to cart - Product ID: {}, User Email: {}, Body: {}", productId, email, body);
        int quantity = body.getOrDefault("quantity", 1);
        Cart updatedCart = cartService.addToCart(email, productId, quantity);
        return ResponseEntity.ok(updatedCart);
    }

    @GetMapping
    public ResponseEntity<Cart> getCart(@RequestHeader("X-User-Email") String email) {
        return ResponseEntity.ok(cartService.getOrCreateCart(email));
    }

    @PutMapping("/update-quantity")
    public ResponseEntity<?> updateQuantity(
            @RequestHeader("X-User-Email") String email,
            @RequestBody Map<String, Object> body) {
        
        Long productId = Long.valueOf(body.get("productId").toString());
        int quantity = Integer.parseInt(body.get("quantity").toString());
        
        Cart updatedCart = cartService.updateQuantity(email, productId, quantity);
        return ResponseEntity.ok(updatedCart);
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<?> removeItem(@PathVariable Long itemId) {
        cartService.removeItem(itemId);
        return ResponseEntity.noContent().build();
    }
    
}