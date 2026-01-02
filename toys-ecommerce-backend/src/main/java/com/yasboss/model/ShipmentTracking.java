package com.yasboss.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "shipment_tracking")
@Data // Using Lombok for Getters/Setters
public class ShipmentTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String orderId;

    @Column(unique = true)
    private String waybillNumber; // 20904216542513

    private String carrier; // e.g., 'Delhivery'
    private String fromCity; // e.g., 'Thiruparankundram'
    private String toCity; // e.g., 'Chennai'
    private String currentLocation; // e.g., 'Chennai_Sriperumbudur_GW'
    
    private Double deadWeight; // 18.00 kg
    private Double volWeight; // 21.00 kg
    
    private String status; // Linked to your React Tabs
    
    private LocalDateTime shipDate; // 26 Dec, 2025
    private LocalDateTime edd; // 30 Dec, 2025
    
    private LocalDateTime lastUpdated;

    @PreUpdate
    public void onUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }
}