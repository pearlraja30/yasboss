package com.yasboss.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class StorageService {

    @Value("${file.upload-dir}")
    private String uploadRoot;

    public String saveFile(MultipartFile file, Long productId, boolean is360, boolean isVideo) throws IOException {
        // 1. Determine sub-folder based on media type
        String subFolder = isVideo ? "videos" : (is360 ? "360" : "images");
        
        // 2. Create physical path: uploads/products/{id}/{type}
        Path productPath = Paths.get(uploadRoot, productId.toString(), subFolder);
        
        if (!Files.exists(productPath)) {
            Files.createDirectories(productPath); // Automatically creates all parent folders
        }

        // 3. Generate a unique filename to prevent duplicates
        String originalFileName = file.getOriginalFilename();
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String uniqueName = UUID.randomUUID().toString() + fileExtension;

        // 4. Save the file physically
        Path targetLocation = productPath.resolve(uniqueName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // 5. Return the RELATIVE path for the database (e.g., /images/6/360/uuid.jpg)
        // This matches the Resource Handler we set up in WebConfig
        return "/images/" + productId + "/" + subFolder + "/" + uniqueName;
    }

    public void deletePhysicalFile(String relativePath) {
        try {
            // Remove the leading "/images/" to match the physical directory structure
            String fixedPath = relativePath.replace("/images/", "");
            Path filePath = Paths.get(uploadRoot).resolve(fixedPath);
            
            Files.deleteIfExists(filePath);
            log.info("Physically deleted file at: {}", filePath);
        } catch (IOException e) {
            log.error("Failed to delete physical file: {}", relativePath);
            // We don't throw an exception here so the DB record can still be cleaned up
        }
    }

    public void deleteProductSubFolder(Long productId, String subFolder) {
        try {
            Path folderPath = Paths.get(uploadRoot, productId.toString(), subFolder);
            if (Files.exists(folderPath)) {
                // This utility deletes the folder only if it is empty
                Files.deleteIfExists(folderPath); 
            }
        } catch (IOException e) {
            log.error("Could not delete folder: {}", e.getMessage());
        }
    }
}