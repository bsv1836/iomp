package com.marketplace.digital_marketplace.dto;

import com.marketplace.digital_marketplace.entity.Product.SaleType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 200)
    private String name;

    private String description;

    @NotNull(message = "Starting price is required")
    @Positive(message = "Starting price must be positive")
    private Double startingPrice;

    @NotNull(message = "Bid increment is required")
    @PositiveOrZero(message = "Bid increment must be positive")
    private Double bidIncrement;

    private LocalDateTime auctionEndTime;

    @NotNull(message = "Sale type is required")
    private SaleType saleType;
}