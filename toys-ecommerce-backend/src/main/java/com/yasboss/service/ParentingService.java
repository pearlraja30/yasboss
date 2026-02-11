package com.yasboss.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yasboss.model.ParentingAgeGroup;
import com.yasboss.repository.ParentingRepository;

@Service
public class ParentingService {

    @Autowired
    private ParentingRepository parentingRepository;
    
    public List<ParentingAgeGroup> findAllByOrderByMinAgeAsc() {
        // Implementation to fetch and return the list of ParentingAgeGroup ordered by minAge ascending
        // This is a placeholder for actual data fetching logic
        return parentingRepository.findAllByOrderByMinAgeAsc();
    }
}
