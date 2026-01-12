package com.yasboss.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "announcements")
@NoArgsConstructor // ✨ Required for JPA
@AllArgsConstructor
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String text;
    @Column(name = "icon_type")
    private String iconType; // e.g., "TRUCK", "SPARKLES", "STAR"
    private String colorHex; // e.g., "#FAB005" for yellow
    @Column(name = "target_link")
    private String targetLink; // The URL to navigate to when clicked
    @JsonProperty("active")
    private boolean active = true;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    // Logic to check if it should be displayed right now
    public boolean isCurrentlyLive() {
        LocalDateTime now = LocalDateTime.now();
        if (!active) return false;
        if (startTime != null && now.isBefore(startTime)) return false;
        if (endTime != null && now.isAfter(endTime)) return false;
        return true;
    }
}