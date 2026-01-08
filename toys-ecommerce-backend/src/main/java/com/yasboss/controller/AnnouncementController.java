package com.yasboss.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.model.Announcement;
import com.yasboss.service.AnnouncementService;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {
    
    @Autowired
    private AnnouncementService service;

    // Public: Used by the Header
    @GetMapping("/active")
    public List<Announcement> getActive() {
        return service.getActiveAnnouncements();
    }

    // Admin Only: Used by AnnouncementManager
    @GetMapping("/all")
    public List<Announcement> getAll() {
        return service.getAllAnnouncements();
    }

    @PostMapping("/create")
    public Announcement create(@RequestBody Announcement announcement) {
        return service.create(announcement);
    }

    @PatchMapping("/{id}/status")
    public Announcement updateStatus(@PathVariable Long id, @RequestParam boolean active) {
        return service.toggleStatus(id, active);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}