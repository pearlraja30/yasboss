package com.yasboss.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "audit_logs")
@Data
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // e.g., "ORDER", "INVENTORY", "USER", "SYSTEM"
    
    @Column(length = 500)
    private String message;
    
    private String performedBy; // Email of the admin/system
    
    private String status; // "success", "warning", "info"
    
    private LocalDateTime timestamp;

    public AuditLog() {
        this.timestamp = LocalDateTime.now();
    }

    public AuditLog(String type, String message, String performedBy, String status) {
        this.type = type;
        this.message = message;
        this.performedBy = performedBy;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }
}