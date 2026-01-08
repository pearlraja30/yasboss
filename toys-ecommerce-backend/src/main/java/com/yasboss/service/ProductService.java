package com.yasboss.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.yasboss.dto.ProductDetailDTO;
import com.yasboss.dto.ProductImageDTO;
import com.yasboss.exception.ResourceNotFoundException;
import com.yasboss.model.Product;
import com.yasboss.model.ProductImage;
import com.yasboss.repository.ProductImageRepository;
import com.yasboss.repository.ProductRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository imageRepository;

    @Autowired
    private StorageService storageService; // ✨ Injected for physical file handling

    // --- 🛒 TOY RETRIEVAL LOGIC ---

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrue();
    }

    /**
     * ✨ Comprehensive Product Detail Fetch
     * Maps brand, descriptions, and full gallery images to DTO.
     */
    public ProductDetailDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Toy with ID " + id + " not found"));

        ProductDetailDTO dto = new ProductDetailDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        dto.setBrand(product.getBrand()); 
        dto.setDetailedDescription(product.getDetailedDescription()); 
        dto.setUseCases(product.getUseCases()); 
        dto.setImageUrl(product.getImageUrl());
        dto.setStockQuantity(product.getStockQuantity()); 
        
        if (product.getImages() != null) {
            List<ProductImageDTO> imageDtos = product.getImages().stream()
                .map(img -> new ProductImageDTO(
                    img.getId(), 
                    img.getImageUrl(), 
                    img.is360View(), // ✨ Entity flag for rotation
                    img.isVideo()    // ✨ Entity flag for video rendering
                ))
                .collect(Collectors.toList());
            dto.setImages(imageDtos);
        }

        return dto;
    }

    // --- 📸 ADVANCED MEDIA HANDLING ---

    /**
     * ✨ Bulk Upload for 360-degree interactive sequences.
     * Physically saves frames and links them to the product in the DB.
     */
    @Transactional
    public List<ProductImage> save360Sequence(Long productId, MultipartFile[] files) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        List<ProductImage> savedImages = new ArrayList<>();

        for (MultipartFile file : files) {
            // 1. Physically save the file using StorageService
            String relativePath = storageService.saveFile(file, productId, true, false);

            // 2. Create the metadata record in DB
            ProductImage image = new ProductImage();
            image.setImageUrl(relativePath);
            image.set360View(true);
            image.setVideo(false);
            image.setProduct(product);

            savedImages.add(imageRepository.save(image));
        }
        log.info("Successfully uploaded {} frames for 360° view of Product ID: {}", files.length, productId);
        return savedImages;
    }

    /**
     * Specialized query for fetching only 360-degree frames.
     */
    public List<ProductImageDTO> get360Gallery(Long productId) {
        return imageRepository.findByProductIdAndIs360ViewTrue(productId)
            .stream()
            .map(img -> new ProductImageDTO(img.getId(), img.getImageUrl(), true, false))
            .collect(Collectors.toList());
    }

    // --- 🔍 FILTERING & SEARCH ---

    public List<Product> getFilteredProducts(String category, String age, String search) {
        String categoryParam = (category != null && !category.trim().isEmpty()) ? category : null;
        String ageParam = (age != null && !age.trim().isEmpty()) ? age : null;
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        log.info("Executing query with Category: {}, Age: {}, Search: {}", categoryParam, ageParam, searchParam);
        return productRepository.findFilteredProducts(categoryParam, ageParam, searchParam);    
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryIgnoreCase(category);
    }

    public List<Product> getProductsByNameFragment(String nameFragment) {
        return productRepository.findByNameContainingIgnoreCase(nameFragment);
    }

    // --- 🛠️ BASIC CRUD ---

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public Optional<Product> findById(Long id) {
        return productRepository.findById(id); 
    }

    // --- 📦 STOCK MANAGEMENT ---

    public long countByStockLessThan(int threshold) {
        return productRepository.countByStockLessThan(threshold);
    }

    public List<Product> findByStockLessThan(int threshold) {
        return productRepository.findByStockLessThan(threshold);
    }

    @Transactional
    public ProductImage uploadSingleMedia(Long productId, MultipartFile file, boolean is360, boolean isVideo) throws IOException {
        // 1. Validate Product exists
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // 2. Physically save file via StorageService
        String relativePath = storageService.saveFile(file, productId, is360, isVideo);

        // 3. Create and save metadata
        ProductImage media = new ProductImage();
        media.setImageUrl(relativePath);
        media.set360View(is360);
        media.setVideo(isVideo);
        media.setProduct(product);

        return imageRepository.save(media);
    }

    @Transactional
    public void deleteProductMedia(Long imageId) {
        // 1. Find the image metadata
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found with id: " + imageId));

        // 2. Delete the physical file first
        storageService.deletePhysicalFile(image.getImageUrl());

        // 3. Delete the database record
        imageRepository.delete(image);
        
        log.info("Successfully removed media ID: {} and its physical file", imageId);
    }

    public List<Product> getFindByAgeRangeIgnoreCase(String ageRange) {
        return productRepository.findByAgeRangeIgnoreCase(ageRange);
    }

    @Transactional
    public void delete360Sequence(Long productId) {
        // 1. Fetch all images flagged as 360View for this product
        List<ProductImage> threeSixtyImages = imageRepository.findByProductIdAndIs360ViewTrue(productId);

        if (threeSixtyImages.isEmpty()) {
            log.warn("No 360° sequence found for Product ID: {}", productId);
            return;
        }

        // 2. Physically delete each file from the hard drive
        for (ProductImage image : threeSixtyImages) {
            storageService.deletePhysicalFile(image.getImageUrl());
        }

        // 3. Remove all metadata records from the database in bulk
        imageRepository.deleteAll(threeSixtyImages);

        log.info("Successfully deleted bulk 360° sequence ({} frames) for Product ID: {}", 
                threeSixtyImages.size(), productId);
    }

}