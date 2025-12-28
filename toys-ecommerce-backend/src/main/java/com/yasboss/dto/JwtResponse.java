package com.yasboss.dto;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String email;

    public JwtResponse(String accessToken, String email) {
        this.token = accessToken;
        this.email = email;
    }
}