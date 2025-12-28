package com.yasboss.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.yasboss.model.CartItem;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    /**
     * Handles persistence for individual items inside the cart.
     * Standard methods like deleteById and save are inherited from JpaRepository.
     */
}