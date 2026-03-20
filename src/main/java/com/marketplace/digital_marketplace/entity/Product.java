package com.marketplace.digital_marketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "starting_price", nullable = false)
    private Double startingPrice;

    @Column(name = "current_price", nullable = false)
    private Double currentPrice;

    @Column(name = "bid_increment", nullable = false)
    private Double bidIncrement;

    @Column(name = "auction_end_time")
    private LocalDateTime auctionEndTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "sale_type", nullable = false)
    private SaleType saleType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = ProductStatus.ACTIVE;
        if (currentPrice == null) currentPrice = startingPrice;
    }

    public enum SaleType { AUCTION, DIRECT }
    public enum ProductStatus { ACTIVE, SOLD, EXPIRED }
}