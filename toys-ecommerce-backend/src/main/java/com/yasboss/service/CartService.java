package com.yasboss.service;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yasboss.model.Cart;
import com.yasboss.model.CartItem;
import com.yasboss.model.Product;
import com.yasboss.model.User;
import com.yasboss.repository.CartItemRepository;
import com.yasboss.repository.CartRepository;
import com.yasboss.repository.ProductRepository;
import com.yasboss.repository.SettingsRepository;
import com.yasboss.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SettingsRepository settingsRepository;

    @Transactional
    public Cart getOrCreateCart(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    @Transactional
    public Cart addToCart(String email, Long productId, int quantity) {
        Cart cart = getOrCreateCart(email);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // ✨ THE FILTER: Checks if this specific toy is already in the bag
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            cartItemRepository.save(newItem);
            cart.getItems().add(newItem);
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateQuantity(String email, Long productId, int quantity) {
        Cart cart = getOrCreateCart(email);
        
        // ✨ THE FILTER: Finds the product to change its quantity
        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
        
        return cartRepository.save(cart);
    }

    @Transactional
    public void removeItem(Long itemId) {
        cartItemRepository.deleteById(itemId);
    }

    public Map<String, Double> getPriceBreakdown(double subtotal) {
        // Fetch dynamic settings
        double taxRate = Double.parseDouble(
            settingsRepository.findById("TAX_PERCENTAGE").map(s -> s.getSettingValue()).orElse("18.0")
        );
        double threshold = Double.parseDouble(
            settingsRepository.findById("FREE_DELIVERY_THRESHOLD").map(s -> s.getSettingValue()).orElse("500.0")
        );

        double taxAmount = (subtotal * taxRate) / 100;
        double shipping = subtotal >= threshold ? 0.0 : 49.0;
        double total = subtotal + taxAmount + shipping;

        return Map.of(
            "subtotal", subtotal,
            "tax", taxAmount,
            "shipping", shipping,
            "total", total
        );
    }
}