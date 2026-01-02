package com.yasboss.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shipment_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String waybillNumber; // Link to the main Shipment

    @Column(nullable = false)
    private String status; // e.g., "In Transit", "Out for Delivery"

    private String location; // e.g., "Chennai_Sriperumbudur_GW"

    @Column(columnDefinition = "TEXT")
    private String activityDetails; // e.g., "Bag Added To Trip" or "Bag Received at Facility"

    @Column(nullable = false)
    private LocalDateTime eventTimestamp; // The exact point in time the event occurred

    /**
     * ✨ Helper for Frontend Date Formatting
     * Formats to "02 Jan, 2026"
     */
    public String getFormattedDate() {
        return eventTimestamp.format(DateTimeFormatter.ofPattern("dd MMM, yyyy"));
    }

    /**
     * ✨ Helper for Frontend Time Formatting
     * Formats to "05:07 pm"
     */
    public String getFormattedTime() {
        return eventTimestamp.format(DateTimeFormatter.ofPattern("hh:mm a")).toLowerCase();
    }
}