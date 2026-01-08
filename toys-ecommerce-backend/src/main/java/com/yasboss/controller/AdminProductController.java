package com.yasboss.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.yasboss.model.ProductImage;
import com.yasboss.service.ProductService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin/products")
@Slf4j
public class AdminProductController {

    @Autowired 
    private ProductService productService; // ✨ Now using Service instead of Repositories

    /**
     * Upload a single media file (Image or Video)
     */
    @PostMapping("/{productId}/media")
    public ResponseEntity<?> uploadProductMedia(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("is360") boolean is360,
            @RequestParam("isVideo") boolean isVideo) {
        
        try {
            // Logic moved to service layer for better maintenance
            ProductImage media = productService.uploadSingleMedia(productId, file, is360, isVideo);
            return ResponseEntity.ok(media);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Could not store file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Error: " + e.getMessage());
        }
    }

    /**
     * Upload an entire folder/array of 360-degree frames
     */
    @PostMapping("/{productId}/upload-360")
    public ResponseEntity<?> upload360Sequence(
            @PathVariable Long productId,
            @RequestParam("files") MultipartFile[] files) {
        try {
            List<ProductImage> images = productService.save360Sequence(productId, files);
            return ResponseEntity.ok(images);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error uploading sequence: " + e.getMessage());
        }
    }

    @DeleteMapping("/{productId}/delete-360")
    public ResponseEntity<?> deleteAll360Frames(@PathVariable Long productId) {
        try {
            productService.delete360Sequence(productId);
            return ResponseEntity.ok().body("360° sequence cleared successfully.");
        } catch (Exception e) {
            log.error("Failed to clear 360° sequence: {}", e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}