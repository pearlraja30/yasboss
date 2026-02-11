package com.yasboss.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
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

    private final AuditService auditService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository imageRepository;

    @Autowired
    private StorageService storageService;

    private final String UPLOAD_DIR = "uploads/products/";

    ProductService(AuditService auditService) {
        this.auditService = auditService;
    }

    // --- 🛒 TOY RETRIEVAL LOGIC ---

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * ✨ Cache high-traffic homepage products.
     * Cleared whenever any product is saved or deleted.
     */
    @Cacheable(value = "featuredProducts")
    public List<Product> getFeaturedProducts() {
        log.info("Fetching featured products from DB...");
        return productRepository.findByIsFeaturedTrue();
    }

    /**
     * ✨ Comprehensive Product Detail Fetch (Cached)
     */
    @Cacheable(value = "productDetails", key = "#id")
    public ProductDetailDTO getProductById(Long id) {
        log.info("Cache miss for Product ID: {}. Fetching from DB...", id);
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
                    img.is360View(), 
                    img.isVideo()    
                ))
                .collect(Collectors.toList());
            dto.setImages(imageDtos);
        }

        return dto;
    }

    // --- 📸 ADVANCED MEDIA HANDLING ---

    /**
     * ✨ 360 Gallery Fetch (Cached)
     */
    @Cacheable(value = "product360Gallery", key = "#productId")
    public List<ProductImageDTO> get360Gallery(Long productId) {
        return imageRepository.findByProductIdAndIs360ViewTrue(productId)
            .stream()
            .map(img -> new ProductImageDTO(img.getId(), img.getImageUrl(), true, false))
            .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"productDetails", "product360Gallery"}, key = "#productId")
    public List<ProductImage> save360Sequence(Long productId, MultipartFile[] files) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        List<ProductImage> savedImages = new ArrayList<>();
        for (MultipartFile file : files) {
            String relativePath = storageService.saveFile(file, productId, true, false);
            ProductImage image = new ProductImage();
            image.setImageUrl(relativePath);
            image.set360View(true);
            image.setVideo(false);
            image.setProduct(product);
            savedImages.add(imageRepository.save(image));
        }
        return savedImages;
    }

    @Transactional
    @CacheEvict(value = {"productDetails", "product360Gallery"}, key = "#productId")
    public void delete360Sequence(Long productId) {
        List<ProductImage> threeSixtyImages = imageRepository.findByProductIdAndIs360ViewTrue(productId);
        if (threeSixtyImages.isEmpty()) return;

        for (ProductImage image : threeSixtyImages) {
            storageService.deletePhysicalFile(image.getImageUrl());
        }
        imageRepository.deleteAll(threeSixtyImages);
    }

    // --- 🛠️ CRUD & STOCK (With Cache Eviction) ---

    /**
     * ✨ Evicts the specific product detail and the general featured list
     * to ensure the store shows updated prices/info.
     */
    @Caching(evict = {
        @CacheEvict(value = "productDetails", key = "#product.id"),
        @CacheEvict(value = "featuredProducts", allEntries = true)
    })
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    
    @Transactional
    public void deleteProduct(Long productId) {
        productRepository.findById(productId).ifPresent(product -> {
            String imageUrl = product.getImageUrl();
            
            // 1. Delete the physical file if it exists
            if (imageUrl != null && imageUrl.startsWith("/uploads/")) {
                try {
                    // Remove the leading slash to match local path (e.g., uploads/products/...)
                    Path filePath = Paths.get(imageUrl.substring(1)); 
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    // We log the error but continue to delete the DB record
                    System.err.println("Could not delete file: " + e.getMessage());
                }
            }
            
            // 2. Delete the database record
            productRepository.deleteById(productId);
        });
    }

    // --- 🔍 FILTERING & SEARCH ---

    public List<Product> getFilteredProducts(String category, String age, String search) {
      log.info("Filtering with - Category: {}, Age: {}, Search: {}", category, age, search);
        // Search/Filter usually shouldn't be cached due to high variability
        return productRepository.findFilteredProducts(category, age, search);    
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryIgnoreCase(category);
    }

    @Transactional
    @CacheEvict(value = "productDetails", key = "#productId")
    public ProductImage uploadSingleMedia(Long productId, MultipartFile file, boolean is360, boolean isVideo) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        String relativePath = storageService.saveFile(file, productId, is360, isVideo);
        ProductImage media = new ProductImage();
        media.setImageUrl(relativePath);
        media.set360View(is360);
        media.setVideo(isVideo);
        media.setProduct(product);

        return imageRepository.save(media);
    }

    /**
     * ✨ Note: This requires a bit of logic to find which product the image belongs to
     * to evict the correct cache.
     */
    @Transactional
    public void deleteProductMedia(Long imageId) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found"));
        
        Long productId = image.getProduct().getId();
        storageService.deletePhysicalFile(image.getImageUrl());
        imageRepository.delete(image);
        
        // Manual eviction if product ID is known
        evictProductCache(productId);
    }

    /**
     * Helper to clear cache manually when complex relationships are deleted
     */
    @CacheEvict(value = {"productDetails", "product360Gallery"}, key = "#productId")
    public void evictProductCache(Long productId) {
        log.info("Manually evicting cache for Product ID: {}", productId);
    }

    @Cacheable(value = "productSearch", key = "#nameFragment")
    public List<Product> getProductsByNameFragment(String nameFragment) {
        if (nameFragment == null || nameFragment.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        log.info("Searching database for keyword: {}", nameFragment);
        return productRepository.findByNameContainingIgnoreCase(nameFragment.trim());
    }

    @CacheEvict(value = "productSearch", allEntries = true)
    public void clearSearchCache() {
        log.info("Clearing all cached search results.");
    }

    // --- REMAINDER OF UNCHANGED METHODS ---
    public Optional<Product> findById(Long id) { return productRepository.findById(id); }
    public long countByStockLessThan(int threshold) { return productRepository.countByStockLessThan(threshold); }
    public List<Product> findByStockLessThan(int threshold) { return productRepository.findByStockLessThan(threshold); }
    public List<Product> getFindByAgeRangeIgnoreCase(String ageRange) { return productRepository.findByAgeRangeIgnoreCase(ageRange); }

    public Product saveProductWithImage(Product product, MultipartFile imageFile) throws IOException {
        // 1. Create directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 2. Generate unique filename to avoid conflicts
        String fileName = UUID.randomUUID().toString() + "_" + imageFile.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);

        // 3. Save file to the physical path
        Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // 4. Store the relative URL in the database
        // This is what React will use to load the image
        product.setImageUrl("/uploads/products/" + fileName);

        return productRepository.save(product);
    }

    public Product addProduct(Product product, String adminEmail) {
        Product saved = productRepository.save(product);
        auditService.log("INVENTORY", "New Asset Deployed: " + saved.getName(), adminEmail, "success");
        return saved;
    }
}