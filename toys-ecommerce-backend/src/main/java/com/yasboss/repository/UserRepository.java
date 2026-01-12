package com.yasboss.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.yasboss.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Used by Spring Security to find a user by their email (username) 
     * for authentication and JWT generation.
     */
    Optional<User> findByEmail(String email);

    /**
     * Helpful for the registration process to ensure 
     * no two accounts use the same email.
     */
    Boolean existsByEmail(String email);

    List<User> findTop10ByOrderByRewardPointsDesc();

}