package com.marketplace.digital_marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BidMessage {

    private String type;        // "NEW_BID" or "AUCTION_CLOSED"
    private Long productId;
    private String productName;
    private Long bidderId;
    private String bidderName;
    private Double bidAmount;
    private LocalDateTime timestamp;
    private String message;     // e.g. "New bid placed!" or "Auction closed! Winner: John"
}