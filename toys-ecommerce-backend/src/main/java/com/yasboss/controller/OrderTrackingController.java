package com.yasboss.controller;

import com.yasboss.dto.TrackingResponseDTO;
import com.yasboss.service.ShipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipments/track")
public class OrderTrackingController {

    @Autowired
    private ShipmentService shipmentService;

    /**
     * ✨ Fetch animated tracking data by Waybill
     */
    @GetMapping("/{waybillNumber}")
    public ResponseEntity<TrackingResponseDTO> getTrackingDetails(@PathVariable String waybillNumber) {
        TrackingResponseDTO response = shipmentService.getTrackingDetails(waybillNumber);
        return ResponseEntity.ok(response);
    }
}