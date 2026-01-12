package com.yasboss.controller;

import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.yasboss.service.ReportService;

@RestController
@RequestMapping("/api/admin/reports")
public class AdminReportController {

    @Autowired
    private ReportService reportService;

    /**
     * ✨ Multi-Format Report Downloader
     * Handles Excel, PDF, and CSV generation based on user selection.
     */
    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadReport(
            @RequestParam String type,
            @RequestParam String start,
            @RequestParam String end,
            @RequestParam(defaultValue = "csv") String format) {

        byte[] content;
        String filename = "yasboss_" + type + "_" + start;
        MediaType mediaType;

        // 1. Determine Content and Media Type
        switch (format.toLowerCase()) {
            case "excel":
                content = reportService.generateExcel(type, start, end);
                filename += ".xlsx";
                mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                break;

            case "pdf":
                content = reportService.generatePdf(type, start, end);
                filename += ".pdf";
                mediaType = MediaType.APPLICATION_PDF;
                break;

            case "csv":
            default:
                String csv = reportService.generateCsv(type, start, end);
                content = csv.getBytes(StandardCharsets.UTF_8);
                filename += ".csv";
                mediaType = MediaType.TEXT_PLAIN;
                break;
        }

        // 2. Build Response with dynamic headers
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(mediaType)
                .body(content);
    }
}