package com.yasboss.dto;

import java.util.List;

import com.yasboss.model.ShipmentLog;

import lombok.Data;

@Data
public class ShipmentProgressDTO {
    private String currentStatus; // Created, In Transit, Out for Delivery, Delivered
    private double progressPercentage; // 0 for Created, 33 for Transit, 66 for OFD, 100 for Delivered
    private List<ShipmentLog> logs;
    // Getters and Setters...
}