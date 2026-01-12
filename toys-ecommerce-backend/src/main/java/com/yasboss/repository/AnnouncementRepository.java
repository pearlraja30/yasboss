package com.yasboss.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.yasboss.model.Announcement;

@Repository
public interface  AnnouncementRepository extends JpaRepository<Announcement, Long>{

    public List<Announcement> findByActiveTrue();

    /**
     * ✨ The "Smart Ticker" Query
     * Fetches only messages that are active and within their scheduled window.
     */
    @Query(value = "SELECT * FROM announcements " +
                   "WHERE active = true " +
                   "AND (start_time IS NULL OR start_time <= CURRENT_TIMESTAMP) " +
                   "AND (end_time IS NULL OR end_time >= CURRENT_TIMESTAMP) " +
                   "ORDER BY id DESC", 
           nativeQuery = true)
    List<Announcement> findAllLiveAnnouncements();

    /**
     * For the Admin Panel, we still want to see everything 
     * (active, paused, and future schedules).
     */
    List<Announcement> findAllByOrderByIdDesc();
    
}
