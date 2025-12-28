package com.yasboss.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.model.Product;
import com.yasboss.repository.ProductRepository;

@RestController
@RequestMapping("/api/admin/inventory")
public class InventoryController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/alerts")
    public List<Product> getLowStockAlerts() {
        return productRepository.findLowStockProducts();
    }
}
