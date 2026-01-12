package com.yasboss.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.model.Order;
import com.yasboss.model.ShipmentTracking;
import com.yasboss.repository.OrderRepository;
import com.yasboss.service.ShipmentService;

@RestController
@RequestMapping("/api/admin/shipments")
public class ShipmentController {

    @Autowired 
    private ShipmentService shipmentService;

    @Autowired
    private OrderRepository orderRepository;


    // GET /api/admin/shipments/counts -> Returns numbers for the tab bubbles
    @GetMapping("/counts")
    public Map<String, Long> getShipmentCounts() {
        return shipmentService.getStatusCounts();
    }

    // GET /api/admin/shipments/filter?status=IN_TRANSIT
    @GetMapping("/filter")
    public List<ShipmentTracking> getFilteredShipments(@RequestParam String status) {
        return shipmentService.findByStatus(status);
    }

    @GetMapping("/admin/shipments/all")
    public List<Order> getAllShipments() {
        // This should return all orders that have entered the logistics phase
        return orderRepository.findByStatusIn(Arrays.asList("DISPATCHED", "SHIPPED", "DELIVERED"));
    }
    }
