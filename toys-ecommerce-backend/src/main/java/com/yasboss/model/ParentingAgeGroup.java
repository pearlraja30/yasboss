package com.yasboss.model;



import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "parenting_age_groups")
@Data
public class ParentingAgeGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name; // e.g., "Infant", "Toddler"
    private String range; // e.g., "0 to 6 Months", "2 to 4 Years"
    private String imageUrl; // Icon URL
    private String categorySlug; // For routing like /parenting/infant
    private Integer minAge;
    private Integer maxAge;
}
