package com.yasboss.controller;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/debug")
public class DiagnosticController {

    @Value("${file.upload-dir:C:/yasboss-uploads}")
    private String uploadRoot;

    @GetMapping("/check-file")
    public Map<String, Object> checkFile(@RequestParam String path) {
        File file = new File(uploadRoot, path);
        Map<String, Object> report = new HashMap<>();
        
        report.put("configured_root", uploadRoot);
        report.put("absolute_path_searched", file.getAbsolutePath());
        report.put("exists", file.exists());
        report.put("can_read", file.canRead());
        report.put("is_file", file.isFile());
        
        return report;
    }
}