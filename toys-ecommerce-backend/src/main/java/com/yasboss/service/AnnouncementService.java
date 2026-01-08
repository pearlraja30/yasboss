package com.yasboss.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yasboss.model.Announcement;
import com.yasboss.repository.AnnouncementRepository;

@Service
public class AnnouncementService {
    @Autowired
    private AnnouncementRepository repository;

    public List<Announcement> getAllAnnouncements() { return repository.findAll(); }

    public List<Announcement> getActiveAnnouncements() { return repository.findByActiveTrue(); }

    public Announcement create(Announcement announcement) { return repository.save(announcement); }

    public void delete(Long id) { repository.deleteById(id); }

    public Announcement toggleStatus(Long id, boolean status) {
        Announcement announcement = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Announcement not found"));
        announcement.setActive(status);
        return repository.save(announcement);
    }
}