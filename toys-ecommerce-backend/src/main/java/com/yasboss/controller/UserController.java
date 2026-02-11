package com.yasboss.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.yasboss.model.Address;
import com.yasboss.model.User;
import com.yasboss.repository.AddressRepository;
import com.yasboss.repository.UserRepository;
import com.yasboss.service.AddressService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AddressService addressService;

    @Autowired
    private AddressRepository addressRepository;



    /**
     * Requirement: Fetch profile data securely using JWT.
     * Path variable {email} removed to prevent unauthorized access.
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get()); // Returns ResponseEntity<User>
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found"); // Returns ResponseEntity<String>
        }
    }
    /**
     * Requirement: Update profile securely.
     * Identity is derived from token, not request body.
     */
    @PutMapping("/profile/update")
    public ResponseEntity<?> updateProfile(@RequestBody User updatedData) {
        // 1. Get identity from the secure JWT token
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        return userRepository.findByEmail(email)
            .map(user -> {
                // 2. Update allowed fields only
                user.setFullName(updatedData.getFullName());
                user.setPhone(updatedData.getPhone());
                
                User savedUser = userRepository.save(user);
                
                // Return the updated user object
                return ResponseEntity.ok(savedUser); 
            })
            // 3. Ensure the error branch returns a compatible ResponseEntity type
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    /**
     * Requirement: Change password securely.
     */
    @PutMapping("/profile/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        return userRepository.findByEmail(email)
            .map(user -> {
                if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Current password is incorrect");
                }

                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return ResponseEntity.ok("Password updated successfully");
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found"));
    }

    @GetMapping("/leaderboard")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'CUSTOMER')")
    public List<Map<String, Object>> getLeaderboard() {
        return userRepository.findTop10ByOrderByRewardPointsDesc().stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            // Use fullName or Name depending on your Model field
            map.put("name", user.getFullName() != null ? user.getFullName() : user.getName());
            map.put("points", user.getRewardPoints());
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping("/profile-image")
    public ResponseEntity<?> uploadProfileImage(@RequestPart("image") MultipartFile file) throws IOException {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String uploadDir = "uploads/profiles/";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        // Use user ID or email to keep filename consistent
        String fileName = user.getId() + "_profile_" + System.currentTimeMillis() + ".jpg";
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Update User Record
        user.setProfileImage("/uploads/profiles/" + fileName);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("imageUrl", user.getProfileImage()));
    }

    @PutMapping("/addresses/{id}/default")
    public ResponseEntity<?> setAddressDefault(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // 1. Fetch all addresses for this user
        List<Address> userAddresses = addressService.getAddressesByEmail(email);
        
        // 2. Logic: Set all to false, then set the chosen one to true
        userAddresses.forEach(addr -> {
            addr.setDefault(addr.getId().equals(id));
        });
        
        addressRepository.saveAll(userAddresses);
        return ResponseEntity.ok("Default address updated");
    }

    @PostMapping("/addresses")
    public ResponseEntity<Address> createAddress(@RequestBody Address address) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(addressService.addAddress(email, address));
    }

    @GetMapping("/addresses")
    public ResponseEntity<List<Address>> getUserAddresses() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(addressService.getAddressesByEmail(email));
    }

    @PutMapping("/update-fcm-token")
    public ResponseEntity<?> updateFcmToken(@RequestBody Map<String, String> request, Principal principal) {
        String token = request.get("token");
        String email = principal.getName(); // Get logged-in user email
        
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setFcmToken(token);
        userRepository.save(user);
        
        return ResponseEntity.ok("Token updated successfully");
    }
}