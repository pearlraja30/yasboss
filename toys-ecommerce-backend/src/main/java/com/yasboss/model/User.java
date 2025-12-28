package com.yasboss.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fullName;
    private String name;
    private String email;
    private String password;
    private String phone;
    private String role = "CUSTOMER"; 

    private String address;

    @Column(name = "reward_points", columnDefinition = "int default 0")
    private Integer rewardPoints = 0;
}