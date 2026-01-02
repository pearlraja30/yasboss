package com.yasboss.dto;

import lombok.Data;

@Data
public class ShipmentUpdateDTO {
    private String waybillNumber;
    private String status;
    private String currentLocation;
    private String remarks;
}