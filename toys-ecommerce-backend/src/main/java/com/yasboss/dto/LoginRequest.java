package com.yasboss.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
    private String fullName;
    private String address;
    private String phone;
}