package com.yasboss.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailDTO {
   private Long id;
    private String name;
    private Double price;
    private String category;
    private String imageUrl; // Main display image
    private String brand; // Brand name (e.g., 'Little Mind')
    private String detailedDescription; // The "Story Behind the Toy"
    private String useCases; // Mapping to "Developmental Focus"
    private Integer stockQuantity; // Used for "Sold Out" logic
    
    // ✨ List of gallery and 360 images
    private List<ProductImageDTO> images;
}