package com.yasboss.repository;

import com.yasboss.model.ShipmentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShipmentLogRepository extends JpaRepository<ShipmentLog, Long> {
    // Fetch logs in descending order so latest activity appears at the top
    List<ShipmentLog> findByWaybillNumberOrderByEventTimestampDesc(String waybillNumber);
}