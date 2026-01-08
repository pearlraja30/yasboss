package com.yasboss.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The relative path to the file (e.g., /images/6/360/uuid.jpg)
    @Column(nullable = false)
    private String imageUrl;

   @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean isVideo = false;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean is360View = false;

    // Relationship to the main Product entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonBackReference // Prevents infinite recursion during JSON serialization
    private Product product;
}