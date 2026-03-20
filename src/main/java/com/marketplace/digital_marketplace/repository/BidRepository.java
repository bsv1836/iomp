package com.marketplace.digital_marketplace.repository;

import com.marketplace.digital_marketplace.entity.Bid;
import com.marketplace.digital_marketplace.entity.Product;
import com.marketplace.digital_marketplace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {

    // All bids for a product — newest first (for bid history)
    List<Bid> findByProductOrderByTimestampDesc(Product product);

    // Highest bid for a product (for winner detection)
    Optional<Bid> findTopByProductOrderByBidAmountDesc(Product product);

    // All bids by a specific user (for my-bids)
    List<Bid> findByBidderOrderByTimestampDesc(User bidder);
}