package com.yasboss.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "global_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GlobalSettings {
    @Id
    private String settingKey; // e.g., "RETURN_WINDOW_DAYS"
    
    private String settingValue; // e.g., "7"
    
    private String description; // e.g., "Max days a customer can raise a return"
}