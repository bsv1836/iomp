package com.marketplace.digital_marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ContactResponse {
    private String sellerName;
    private String sellerEmail;
    private String sellerMobile;

    private String winnerName;
    private String winnerEmail;
    private String winnerMobile;
}