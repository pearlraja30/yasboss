package com.yasboss.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageDTO {
    private Long id;
    
    /** * The path to the image stored on your server.
     * Example: "/uploads/products/bowling_side.jpg" 
     */
    private String imageUrl; 

    private boolean is360View;
    
    private boolean isVideo; 
}