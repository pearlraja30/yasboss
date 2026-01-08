package com.yasboss.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.yasboss.model.Announcement;

@Repository
public interface  AnnouncementRepository extends JpaRepository<Announcement, Long>{

    public List<Announcement> findByActiveTrue();
    
}
