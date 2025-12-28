package com.yasboss.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue; 
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String category;
    private Double mrpPrice;
    private Double sellingPrice;
    private Integer discountPct;
    private String imageUrl;
    
    @Column(columnDefinition = "TEXT")
    private String shortDescription;
    
    @Column(columnDefinition = "TEXT")
    private String detailedDescription;
    
    private String ageRange;
    private Boolean isFeatured;
    private Integer stock;
    private Double price;

    private String brand;
    private String sku;
    private String weight;
    private String dimensions;


    @Column(columnDefinition = "TEXT")
    private String longDescription;
    
    @Column(columnDefinition = "TEXT")
    private String useCases;

    @Column(columnDefinition = "TEXT")
    private String material_info;

    // Fixed: CascadeType.ALL and FetchType.LAZY now have correct imports
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference 
    private List<ProductImage> images;
    
    private Integer stockQuantity;
    private Integer lowStockThreshold = 5;
}