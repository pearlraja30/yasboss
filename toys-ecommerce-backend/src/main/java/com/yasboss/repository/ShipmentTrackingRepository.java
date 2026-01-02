package com.yasboss.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.yasboss.model.ShipmentTracking;

@Repository
public interface ShipmentTrackingRepository extends JpaRepository<ShipmentTracking, Long> {
    
    // Finds shipments for specific tabs like 'IN_TRANSIT' or 'DELIVERED'
    List<ShipmentTracking> findByStatus(String status);
    
    // Used for syncing updates from vendor webhooks
    Optional<ShipmentTracking> findByWaybillNumber(String waybillNumber);
    
    // Check if a shipment already exists for an order
    Optional<ShipmentTracking> findByOrderId(String orderId);
}