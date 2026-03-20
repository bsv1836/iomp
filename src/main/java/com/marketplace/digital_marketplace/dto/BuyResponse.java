package com.marketplace.digital_marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BuyResponse {

    private Long productId;
    private String productName;
    private Double price;
    private Long buyerId;
    private String buyerName;
    private String message;
    private LocalDateTime purchasedAt;
}