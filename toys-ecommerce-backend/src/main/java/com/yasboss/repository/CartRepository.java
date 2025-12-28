package com.yasboss.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.yasboss.model.Cart;
import com.yasboss.model.User;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    // ✨ Finds the cart belonging to a specific user object
    Optional<Cart> findByUser(User user);
}