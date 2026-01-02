package com.yasboss.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yasboss.dto.TrackingResponseDTO;
import com.yasboss.model.ShipmentTracking;
import com.yasboss.repository.ShipmentLogRepository;
import com.yasboss.repository.ShipmentTrackingRepository;

@Service
public class ShipmentService {

    @Autowired
    private ShipmentTrackingRepository shipmentRepository;


    @Autowired
    private ShipmentLogRepository logRepo;

    public TrackingResponseDTO getTrackingDetails(String waybill) {
        ShipmentTracking shipment = shipmentRepository.findByWaybillNumber(waybill)
            .orElseThrow(() -> new RuntimeException("Waybill not found"));

        TrackingResponseDTO dto = new TrackingResponseDTO();
        dto.setShipment(shipment);
        dto.setLogs(logRepo.findByWaybillNumberOrderByEventTimestampDesc(waybill));
        
        // ✨ THE ANIMATION LOGIC
        // Mapping status to percentage for the React truck movement
        double percentage = switch (shipment.getStatus().toUpperCase()) {
            case "CREATED", "ORDER_PLACED" -> 0.0;
            case "IN_TRANSIT", "MANIFESTED" -> 33.3;
            case "OUT_FOR_DELIVERY" -> 66.6;
            case "DELIVERED" -> 100.0;
            default -> 0.0;
        };
        
        dto.setProgressPercentage(percentage);
        return dto;
    }
    /**
     * ✨ Status Counts for Dashboard Tabs
     * Returns a map of status names and their current counts.
     */
    public Map<String, Long> getStatusCounts() {
        List<ShipmentTracking> allShipments = shipmentRepository.findAll();
        Map<String, Long> counts = new HashMap<>();
        
        // Initialize all keys to zero as per UI requirements
        counts.put("ORDERS", 0L);
        counts.put("CANCELLATIONS", 0L);
        counts.put("MANIFESTED", 0L);
        counts.put("PICKUP_SCHEDULED", 0L);
        counts.put("IN_TRANSIT", 0L);
        counts.put("RTO", 0L);
        counts.put("DELIVERED", 0L);
        counts.put("ALL", (long) allShipments.size());

        // Aggregate counts based on DB status
        allShipments.forEach(s -> {
            String status = s.getStatus().toString();
            counts.put(status, counts.getOrDefault(status, 0L) + 1);
        });

        return counts;
    }

    /**
     * ✨ Filtered Shipment List
     * Fetches data specifically for the active tab.
     */
    public List<ShipmentTracking> getShipmentsByStatus(String status) {
        if ("ALL".equalsIgnoreCase(status)) {
            return shipmentRepository.findAll();
        }
        return shipmentRepository.findByStatus(status);
    }

    /**
     * ✨ Vendor Sync Logic
     * Simulates integration with carriers like Delhivery.
     */
    public void syncWithVendor(String waybill, String newStatus, String location) {
        shipmentRepository.findByWaybillNumber(waybill).ifPresent(shipment -> {
            shipment.setStatus(newStatus);
            shipment.setCurrentLocation(location);
            shipment.setLastUpdated(java.time.LocalDateTime.now());
            shipmentRepository.save(shipment);
        });
    }

    public List<ShipmentTracking> findByStatus(String status) {
        return getShipmentsByStatus(status);
    }
}