package com.marketplace.digital_marketplace.dto;

import com.marketplace.digital_marketplace.entity.Product;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Starting price is required")
    @Positive(message = "Starting price must be positive")
    private Double startingPrice;

    @Positive(message = "Bid increment must be positive")
    private Double bidIncrement;

    private LocalDateTime auctionEndTime;

    @NotNull(message = "Sale type is required")
    private Product.SaleType saleType;

    // ─── New Fields ──────────────────────────────────────────────────
    private String category;
    private String brand;
    private String productCondition;
    private String damages;
    private String location;
    private Integer purchaseMonth;
    private Integer purchaseYear;
    private String warrantyRemaining;
}