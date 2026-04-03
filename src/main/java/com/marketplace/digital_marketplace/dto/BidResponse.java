package com.marketplace.digital_marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BidResponse {

    private Long bidId;
    private Long productId;
    private String productName;
    private Long bidderId;
    private String bidderName;
    private String bidderProfilePhoto;
    private Double bidAmount;
    private LocalDateTime timestamp;
}