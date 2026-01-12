package com.yasboss.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.service.OfferService;

@RestController
@RequestMapping("/api/admin/offers")
public class OfferController {

    @Autowired
    private OfferService offerService;

    @PostMapping("/global")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> applyGlobal(@RequestParam Double percentage) {
        offerService.applyGlobalDiscount(percentage);
        return ResponseEntity.ok("Global discount applied successfully");
    }

    @PostMapping("/reset")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> reset() {
        offerService.resetGlobalDiscounts();
        return ResponseEntity.ok("Prices reset to original");
    }
}