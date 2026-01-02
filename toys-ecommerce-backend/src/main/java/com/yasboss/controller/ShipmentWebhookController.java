package com.yasboss.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.dto.ShipmentUpdateDTO;
import com.yasboss.service.ShipmentService;

@RestController
@RequestMapping("/api/webhooks/shipments")
public class ShipmentWebhookController {

    @Autowired
    private ShipmentService shipmentService;

    @PostMapping("/delhivery-update")
    public ResponseEntity<String> handleVendorUpdate(@RequestBody ShipmentUpdateDTO update) {
        // Automatically updates the PostgreSQL table
        shipmentService.syncWithVendor(
            update.getWaybillNumber(), 
            update.getStatus(), 
            update.getCurrentLocation()
        );
        return ResponseEntity.ok("ACKNOWLEDGED");
    }
}