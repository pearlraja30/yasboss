package com.yasboss.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.model.ProductImage;
import com.yasboss.repository.ProductImageRepository;

@RestController
@RequestMapping("/api/admin/gallery")
public class AdminImageController {

    @Autowired
    private ProductImageRepository imageRepository;

    /**
     * ✨ DELETE IMAGE: Removes from both DB and Disk.
     */
    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteImage(@PathVariable Long imageId) {
        ProductImage image = imageRepository.findById(imageId)
            .orElseThrow(() -> new RuntimeException("Image not found"));

        try {
            // 1. Remove physical file from /uploads/products/
            // We remove the leading "/" to get the relative path
            Path path = Paths.get(image.getImageUrl().substring(1)); 
            Files.deleteIfExists(path);

            // 2. Remove database record
            imageRepository.delete(image);

            return ResponseEntity.ok("Image deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error deleting file: " + e.getMessage());
        }
    }
}