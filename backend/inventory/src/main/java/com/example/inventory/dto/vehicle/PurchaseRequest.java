package com.example.inventory.dto.vehicle;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequest {

    @Min(value = 1, message = "Purchase quantity must be at least 1")
    private Integer quantity = 1;
}