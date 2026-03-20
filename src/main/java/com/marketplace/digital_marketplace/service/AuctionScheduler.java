package com.marketplace.digital_marketplace.service;

import com.marketplace.digital_marketplace.dto.BidMessage;
import com.marketplace.digital_marketplace.entity.Bid;
import com.marketplace.digital_marketplace.entity.Product;
import com.marketplace.digital_marketplace.repository.BidRepository;
import com.marketplace.digital_marketplace.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AuctionScheduler {

    private final ProductRepository productRepository;
    private final BidRepository bidRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Runs every 60 seconds automatically
    @Scheduled(fixedRate = 60000)
    public void closeExpiredAuctions() {

        // Find all products that are still ACTIVE but end time has passed
        List<Product> expiredAuctions = productRepository
                .findByStatusAndAuctionEndTimeBefore(
                        Product.ProductStatus.ACTIVE,
                        LocalDateTime.now()
                );

        for (Product product : expiredAuctions) {

            // Find the highest bid for this product
            Optional<Bid> highestBid = bidRepository
                    .findTopByProductOrderByBidAmountDesc(product);

            BidMessage closeMessage;

            if (highestBid.isPresent()) {
                // There was at least one bid — mark as SOLD
                product.setStatus(Product.ProductStatus.SOLD);

                String winnerName = highestBid.get().getBidder().getName();
                Double winningAmount = highestBid.get().getBidAmount();

                System.out.println("Auction CLOSED (SOLD): " + product.getName()
                        + " | Winner: " + winnerName
                        + " | Amount: " + winningAmount);

                // Broadcast winner to EVERYONE viewing this auction
                closeMessage = new BidMessage(
                        "AUCTION_CLOSED",
                        product.getProductId(),
                        product.getName(),
                        highestBid.get().getBidder().getId(),
                        winnerName,
                        winningAmount,
                        LocalDateTime.now(),
                        "Auction closed! Winner: " + winnerName
                                + " with bid of ₹" + winningAmount
                );

            } else {
                // No bids were placed — mark as EXPIRED
                product.setStatus(Product.ProductStatus.EXPIRED);

                System.out.println("Auction CLOSED (EXPIRED): "
                        + product.getName() + " | No bids placed");

                // Broadcast no winner to everyone viewing this auction
                closeMessage = new BidMessage(
                        "AUCTION_CLOSED",
                        product.getProductId(),
                        product.getName(),
                        null,
                        null,
                        null,
                        LocalDateTime.now(),
                        "Auction closed! No bids were placed."
                );
            }

            productRepository.save(product);

            // Broadcast to /topic/bids/{productId}
            // Everyone viewing this auction page receives this instantly
            messagingTemplate.convertAndSend(
                    "/topic/bids/" + product.getProductId(), closeMessage);
        }
    }
}