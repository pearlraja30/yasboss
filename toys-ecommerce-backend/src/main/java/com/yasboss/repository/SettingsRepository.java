package com.yasboss.repository;

import com.yasboss.model.GlobalSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SettingsRepository extends JpaRepository<GlobalSettings, String> {
}