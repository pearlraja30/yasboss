package com.yasboss.model;



import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "addresses")
@Data
public class Address {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String userEmail;
    private String fullName;
    private String phone;
    private String street;
    private String city;
    private String zip;
    private String state;
    private boolean isDefault;
    private String addressType; // "HOME", "WORK", "OTHER"
}