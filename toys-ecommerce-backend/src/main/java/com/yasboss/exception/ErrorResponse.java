package com.yasboss.exception;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ErrorResponse {
    private int status;          // e.g., 404
    private String message;     // e.g., "Toy with ID 6 not found"
    private LocalDateTime timestamp;
}