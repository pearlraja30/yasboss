package com.yasboss.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yasboss.repository.SettingsRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.yasboss.model.GlobalSettings;


@RestController
@RequestMapping("/api/admin/settings")
public class AdminSettingsController {

    @Autowired
    private SettingsRepository settingsRepository;

    @GetMapping("path")
    public String getMethodName(@RequestParam String param) {
        return new String();
    }
    
    public List<GlobalSettings> getAllSettings() {
        return settingsRepository.findAll();
    }

    @PutMapping("/{key}")
    public ResponseEntity<?> updateSetting(@PathVariable String key, @RequestBody Map<String, String> body) {
        return settingsRepository.findById(key)
            .map(setting -> {
                setting.setSettingValue(body.get("settingValue"));
                settingsRepository.save(setting);
                return ResponseEntity.ok(setting);
            }).orElse(ResponseEntity.notFound().build());
    }
}