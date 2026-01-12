package com.yasboss.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import com.yasboss.model.Announcement;
import com.yasboss.repository.AnnouncementRepository;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository repository;

    public List<Announcement> getAllAnnouncements() { return repository.findAll(); }

    public List<Announcement> getActiveAnnouncements() { return repository.findByActiveTrue(); }

    @CacheEvict(value = "liveAnnouncements", allEntries = true)
    public Announcement create(Announcement announcement) { 
        return repository.save(announcement); 
    }

    @CacheEvict(value = "liveAnnouncements", allEntries = true)
    public void delete(Long id) { 
        repository.deleteById(id); 
    }

    public Announcement toggleStatus(Long id, boolean status) {
        Announcement announcement = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Announcement not found"));
        announcement.setActive(status);
        return repository.save(announcement);
    }

    @org.springframework.cache.annotation.Cacheable(value = "liveAnnouncements")
    public List<Announcement> getLiveAnnouncements() {
        System.out.println("fetching from database..."); // You'll only see this once
        return repository.findAllLiveAnnouncements();
    }

    // 🛠️ Used by the Admin Panel (AnnouncementManager)
    public List<Announcement> getAllForAdmin() {
        return repository.findAllByOrderByIdDesc();
    }
    
    @CacheEvict(value = "liveAnnouncements", allEntries = true)
    public void updateStatus(Long id, boolean active) {
        Announcement a = repository.findById(id).orElseThrow();
        a.setActive(active);
        repository.save(a);
    }

    public List<Announcement> getCurrentlyLiveMessages() {
    LocalDateTime now = LocalDateTime.now();
    return repository.findAll().stream()
        .filter(Announcement::isActive)
        .filter(a -> a.getStartTime() == null || now.isAfter(a.getStartTime()))
        .filter(a -> a.getEndTime() == null || now.isBefore(a.getEndTime()))
        .collect(Collectors.toList());
}
}