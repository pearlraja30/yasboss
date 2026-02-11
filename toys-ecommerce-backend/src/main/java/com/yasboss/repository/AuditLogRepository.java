package com.yasboss.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yasboss.model.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop20ByOrderByTimestampDesc();
}
