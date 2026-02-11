package com.yasboss.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.yasboss.model.BabyProfile;

@Repository
public interface BabyProfileRepository extends JpaRepository<BabyProfile, Long> {
    
    // Find the baby profile linked to a specific user
    Optional<BabyProfile> findByUserId(Long userId);
}