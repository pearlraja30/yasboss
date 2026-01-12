package com.yasboss.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.yasboss.model.Address;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    // Find all addresses belonging to a specific customer
    List<Address> findByUserEmail(String userEmail);
    
    // Find the current default address for a user (useful for checkout)
    Address findByUserEmailAndIsDefaultTrue(String userEmail);
}