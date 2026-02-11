package com.yasboss.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.yasboss.model.AuditLog;
import com.yasboss.repository.AuditLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepository auditLogRepository;

    public void log(String type, String message, String performedBy, String status) {
        auditLogRepository.save(new AuditLog(type, message, performedBy, status));
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop20ByOrderByTimestampDesc();
    }
}