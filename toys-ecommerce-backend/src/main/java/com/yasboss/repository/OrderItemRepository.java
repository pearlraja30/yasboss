package com.yasboss.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.yasboss.model.OrderItem;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    // Fetches all individual toy records for a specific transaction ID
    List<OrderItem> findByOrderId(Long orderId);
}