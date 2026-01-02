package com.yasboss.dto;

import com.yasboss.model.ShipmentTracking;
import com.yasboss.model.ShipmentLog;
import lombok.Data;
import java.util.List;

@Data
public class TrackingResponseDTO {
    private ShipmentTracking shipment; // Carrier, Mode of Payment, EDD
    private List<ShipmentLog> logs;     // List of activity logs for the timeline
    private double progressPercentage;  // Value for truck animation (0-100)
}