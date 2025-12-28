package com.yasboss.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yasboss.dto.OrderRequest;
import com.yasboss.model.CartItem;
import com.yasboss.model.Order;
import com.yasboss.model.OrderItem;
import com.yasboss.repository.OrderItemRepository;
import com.yasboss.repository.OrderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CheckoutService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    /**
     * Processes the checkout request from the React frontend.
     * Generates a unique YB- ID and saves snapshots of products in OrderItems.
     */
    @Transactional
    public String processCheckout(OrderRequest request) {
        // 1. Initialize the Order entity
        Order order = new Order();
        
        // Generate the unique readable Order ID
        String friendlyOrderId = "YB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        order.setOrderId(friendlyOrderId);
        
        order.setUserEmail(request.getUserEmail());
        order.setTotalAmount(request.getTotalAmount());
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus("PENDING");

        // 2. Save the parent Order first to generate the DB primary key
        Order savedOrder = orderRepository.save(order);

        // 3. Convert CartItems from the request into OrderItem snapshots
        List<OrderItem> orderItems = new ArrayList<>();
        
        for (CartItem cartItem : request.getItems()) {
            OrderItem orderItem = new OrderItem();
            
            // Map the snapshotted data from the frontend
            orderItem.setProductId(cartItem.getId());
            orderItem.setProductName(cartItem.getName());
            orderItem.setPrice(cartItem.getPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setImageUrl(cartItem.getImageUrl());
            
            // Set the bidirectional relationship
            orderItem.setOrder(savedOrder);
            
            orderItems.add(orderItem);
        }

        // 4. Save all order items to the database
        orderItemRepository.saveAll(orderItems);

        return friendlyOrderId;
    }
}