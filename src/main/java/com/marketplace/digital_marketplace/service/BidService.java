package com.marketplace.digital_marketplace.service;

import com.marketplace.digital_marketplace.dto.BidMessage;
import com.marketplace.digital_marketplace.dto.BidRequest;
import com.marketplace.digital_marketplace.dto.BidResponse;
import com.marketplace.digital_marketplace.entity.Bid;
import com.marketplace.digital_marketplace.entity.Product;
import com.marketplace.digital_marketplace.entity.User;
import com.marketplace.digital_marketplace.repository.BidRepository;
import com.marketplace.digital_marketplace.repository.ProductRepository;
import com.marketplace.digital_marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ─── Place a Bid ────────────────────────────────────────────────
    public BidResponse placeBid(Long productId, BidRequest request, String bidderEmail) {

        // 1. Fetch product — throw error if not found
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 2. Check sale type first — must be AUCTION
        if (product.getSaleType() == Product.SaleType.DIRECT) {
            throw new RuntimeException(
                    "This is a direct sale product. Use the buy endpoint instead.");
        }

        // 3. Auction must be ACTIVE
        if (product.getStatus() != Product.ProductStatus.ACTIVE) {
            throw new RuntimeException("Auction is not active");
        }

        // 4. Auction end time must not have passed
        if (product.getAuctionEndTime() == null ||
                product.getAuctionEndTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Auction has already ended");
        }

        // 5. Fetch the bidder
        User bidder = userRepository.findByEmail(bidderEmail)
                .orElseThrow(() -> new RuntimeException("Bidder not found"));

        // 6. Bidder must NOT be the seller
        if (product.getSeller().getId().equals(bidder.getId())) {
            throw new RuntimeException("Seller cannot bid on their own product");
        }

        // 7. Bid amount must not be null and must be >= currentPrice + bidIncrement
        if (request.getBidAmount() == null) {
            throw new RuntimeException("Bid amount is required");
        }
        double minimumBid = product.getCurrentPrice() + product.getBidIncrement();
        if (request.getBidAmount() < minimumBid) {
            throw new RuntimeException(
                    "Bid too low. Minimum bid is " + minimumBid
            );
        }

        // 8. Save the bid
        Bid bid = Bid.builder()
                .product(product)
                .bidder(bidder)
                .bidAmount(request.getBidAmount())
                .build();
        bidRepository.save(bid);

        // 9. Update current price on the product
        product.setCurrentPrice(request.getBidAmount());
        productRepository.save(product);

        // 10. Broadcast new bid to all viewers of this auction
        BidMessage bidMessage = new BidMessage(
                "NEW_BID",
                product.getProductId(),
                product.getName(),
                bidder.getId(),
                bidder.getName(),
                request.getBidAmount(),
                bid.getTimestamp(),
                "New bid placed by " + bidder.getName()
        );
        messagingTemplate.convertAndSend(
                "/topic/bids/" + productId, bidMessage);

        return mapToResponse(bid);
    }

    // ─── Get Highest Bid (public) ────────────────────────────────────
    public BidResponse getHighestBid(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Bid highestBid = bidRepository.findTopByProductOrderByBidAmountDesc(product)
                .orElseThrow(() -> new RuntimeException("No bids placed yet"));

        return mapToResponse(highestBid);
    }

    // ─── Get Bid History (seller only) ──────────────────────────────
    public List<BidResponse> getBidHistory(Long productId, String requesterEmail) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getEmail().equals(requesterEmail)) {
            throw new RuntimeException("FORBIDDEN");
        }

        return bidRepository.findByProductOrderByTimestampDesc(product)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── Get My Bids (logged in user) ────────────────────────────────
    public List<BidResponse> getMyBids(String bidderEmail) {
        User bidder = userRepository.findByEmail(bidderEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bidRepository.findByBidderOrderByTimestampDesc(bidder)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── Helper: Convert Bid entity to BidResponse DTO ──────────────
    private BidResponse mapToResponse(Bid bid) {
        return new BidResponse(
                bid.getBidId(),
                bid.getProduct().getProductId(),
                bid.getProduct().getName(),
                bid.getBidder().getId(),
                bid.getBidder().getName(),
                bid.getBidAmount(),
                bid.getTimestamp()
        );
    }
}