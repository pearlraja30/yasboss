package com.yasboss.service;

import com.yasboss.repository.SettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SettingsService {

    @Autowired
    private SettingsRepository settingsRepository;

    public int getReturnWindow() {
        return Integer.parseInt(
            settingsRepository.findById("RETURN_WINDOW_DAYS")
                .map(s -> s.getSettingValue())
                .orElse("7") // Default fallback
        );
    }

    public void updateSetting(String key, String value) {
        settingsRepository.findById(key).ifPresent(setting -> {
            setting.setSettingValue(value);
            settingsRepository.save(setting);
        });
    }
}