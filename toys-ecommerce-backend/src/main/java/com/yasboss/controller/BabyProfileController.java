package com.yasboss.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.model.BabyProfile;
import com.yasboss.repository.BabyProfileRepository;

@RestController
@RequestMapping("/api/parenting/profile")
public class BabyProfileController {

    @Autowired
    private BabyProfileRepository profileRepo;

    // Get profile by User ID
    @GetMapping("/{userId}")
    public ResponseEntity<BabyProfile> getProfile(@PathVariable Long userId) {
        return profileRepo.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    // Save or Update profile
    @PostMapping
    public ResponseEntity<BabyProfile> saveProfile(@RequestBody BabyProfile profile) {
        // Check if profile already exists for this user to perform an update
        return profileRepo.findByUserId(profile.getUserId())
                .map(existingProfile -> {
                    existingProfile.setBabyName(profile.getBabyName());
                    existingProfile.setBirthDate(profile.getBirthDate());
                    existingProfile.setGender(profile.getGender());
                    return ResponseEntity.ok(profileRepo.save(existingProfile));
                })
                .orElseGet(() -> ResponseEntity.ok(profileRepo.save(profile)));
    }
}