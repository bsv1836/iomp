package com.marketplace.digital_marketplace.repository;

import com.marketplace.digital_marketplace.entity.Product;
import com.marketplace.digital_marketplace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Used by ProductService — get all active products
    List<Product> findByStatus(Product.ProductStatus status);

    // Used by ProductService — get products by seller object
    List<Product> findBySeller(User seller);

    // Used by AuctionScheduler — find expired auctions
    List<Product> findByStatusAndAuctionEndTimeBefore(
            Product.ProductStatus status,
            LocalDateTime time
    );
}