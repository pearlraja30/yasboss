package com.yasboss.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.yasboss.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // FIX: Changed from findByUserEmailOrderByDateDesc to findByUserEmailOrderByCreatedAtDesc
    List<Order> findByUserEmailOrderByCreatedAtDesc(String email);

    // FIX: Changed from findAllByOrderByDateDesc to findAllByOrderByCreatedAtDesc
    List<Order> findAllByOrderByCreatedAtDesc();

    Optional<Order> findByOrderId(String orderId);

    @Query("SELECT SUM(o.totalAmount) FROM Order o")
    Double getTotalRevenue();

    // FIX: Count orders based on their status (PENDING, SHIPPED, etc.)
    long countByStatus(String status);

    List<Order> findByCustomerPhoneOrderByOrderDateDesc(String phone);
}