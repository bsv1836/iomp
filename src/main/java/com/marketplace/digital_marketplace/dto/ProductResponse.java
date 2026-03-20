package com.marketplace.digital_marketplace.dto;

import com.marketplace.digital_marketplace.entity.Product;
import com.marketplace.digital_marketplace.entity.Product.ProductStatus;
import com.marketplace.digital_marketplace.entity.Product.SaleType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponse {

    private Long productId;
    private Long sellerId;
    private String sellerName;
    private String name;
    private String description;
    private Double startingPrice;
    private Double currentPrice;
    private Double bidIncrement;
    private LocalDateTime auctionEndTime;
    private SaleType saleType;
    private ProductStatus status;
    private LocalDateTime createdAt;

    public static ProductResponse from(Product p) {
        return ProductResponse.builder()
                .productId(p.getProductId())
                .sellerId(p.getSeller().getId())
                .sellerName(p.getSeller().getName())
                .name(p.getName())
                .description(p.getDescription())
                .startingPrice(p.getStartingPrice())
                .currentPrice(p.getCurrentPrice())
                .bidIncrement(p.getBidIncrement())
                .auctionEndTime(p.getAuctionEndTime())
                .saleType(p.getSaleType())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .build();
    }
}