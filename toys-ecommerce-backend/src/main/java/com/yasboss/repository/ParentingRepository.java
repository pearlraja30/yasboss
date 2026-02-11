package com.yasboss.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.yasboss.model.ParentingAgeGroup;

@Repository
public interface ParentingRepository extends JpaRepository<ParentingAgeGroup, Long> {

    /**
     * ✨ Fetches all age groups ordered by age for the Hub sidebar.
     * Spring Data JPA interprets "OrderByMinAgeAsc" and writes the SQL for you.
     */
    List<ParentingAgeGroup> findAllByOrderByMinAgeAsc();

    /**
     * ✨ Used to find details when a user clicks a specific category (e.g., 'toddler').
     */
    Optional<ParentingAgeGroup> findByCategorySlug(String categorySlug);

    
}