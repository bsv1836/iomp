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

    // ─── New Fields ──────────────────────────────────────────────────

    @Column(length = 100)
    private String category;

    @Column(length = 100)
    private String brand;

    @Column(name = "product_condition", length = 50)
    private String productCondition;      // e.g. "Like New", "Good", "Fair", "Poor"

    @Column(columnDefinition = "TEXT")
    private String damages;        // description of any damages

    @Column(length = 100)
    private String location;       // city/area of seller

    @Column(name = "purchase_month")
    private Integer purchaseMonth; // 1-12

    @Column(name = "purchase_year")
    private Integer purchaseYear;  // e.g. 2022

    @Column(name = "warranty_remaining", length = 100)
    private String warrantyRemaining; // e.g. "6 months", "None"

    @Column(name = "image_path", length = 500)
    private String imagePath;      // path to uploaded image

    @Column(name = "winner_id")
    private Long winnerId;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = ProductStatus.ACTIVE;
        if (currentPrice == null) currentPrice = startingPrice;
        if (bidIncrement == null) bidIncrement = 0.0;
    }

    public enum SaleType { AUCTION, DIRECT }
    public enum ProductStatus { ACTIVE, SOLD, EXPIRED, PENDING }
}