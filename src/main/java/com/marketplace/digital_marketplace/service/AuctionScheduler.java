package com.marketplace.digital_marketplace.service;

import com.marketplace.digital_marketplace.dto.BidMessage;
import com.marketplace.digital_marketplace.entity.Bid;
import com.marketplace.digital_marketplace.entity.Notification;
import com.marketplace.digital_marketplace.entity.Product;
import com.marketplace.digital_marketplace.entity.User;
import com.marketplace.digital_marketplace.repository.BidRepository;
import com.marketplace.digital_marketplace.repository.NotificationRepository;
import com.marketplace.digital_marketplace.repository.ProductRepository;
import com.marketplace.digital_marketplace.repository.UserRepository;
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
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedRate = 60000)
    public void closeExpiredAuctions() {

        List<Product> expiredAuctions = productRepository
                .findByStatusAndAuctionEndTimeBefore(
                        Product.ProductStatus.ACTIVE,
                        LocalDateTime.now()
                );

        for (Product product : expiredAuctions) {

            Optional<Bid> highestBid = bidRepository
                    .findTopByProductOrderByBidAmountDesc(product);

            BidMessage closeMessage;

            if (highestBid.isPresent()) {
                User winner = highestBid.get().getBidder();
                Double winningAmount = highestBid.get().getBidAmount();

                // Set status to PENDING — waits for seller confirmation
                product.setStatus(Product.ProductStatus.PENDING);
                product.setWinnerId(winner.getId());
                productRepository.save(product);

                System.out.println("Auction PENDING: " + product.getName()
                        + " | Winner: " + winner.getName()
                        + " | Amount: " + winningAmount);

                // ── Create notification for winner ──
                Notification winnerNotification = Notification.builder()
                        .user(winner)
                        .message("🏆 Congratulations! You won the auction for '"
                                + product.getName()
                                + "' with a bid of ₹" + winningAmount
                                + "! The seller will confirm the sale shortly.")
                        .productId(product.getProductId())
                        .build();
                notificationRepository.save(winnerNotification);

                // ── Create notification for seller ──
                Notification sellerNotification = Notification.builder()
                        .user(product.getSeller())
                        .message("🎉 Your auction for '" + product.getName()
                                + "' has ended! Winner: " + winner.getName()
                                + " with bid of ₹" + winningAmount
                                + ". Please confirm the sale in your profile.")
                        .productId(product.getProductId())
                        .build();
                notificationRepository.save(sellerNotification);

                // ── Broadcast to all viewers ──
                closeMessage = new BidMessage(
                        "AUCTION_CLOSED",
                        product.getProductId(),
                        product.getName(),
                        winner.getId(),
                        winner.getName(),
                        winningAmount,
                        LocalDateTime.now(),
                        "Auction closed! Winner: " + winner.getName()
                                + " with bid of ₹" + winningAmount
                                + ". Awaiting seller confirmation."
                );

            } else {
                // No bids — mark as EXPIRED
                product.setStatus(Product.ProductStatus.EXPIRED);
                productRepository.save(product);

                System.out.println("Auction EXPIRED: "
                        + product.getName() + " | No bids placed");

                closeMessage = new BidMessage(
                        "AUCTION_CLOSED",
                        product.getProductId(),
                        product.getName(),
                        null, null, null,
                        LocalDateTime.now(),
                        "Auction closed with no bids."
                );
            }

            messagingTemplate.convertAndSend(
                    "/topic/bids/" + product.getProductId(), closeMessage);
        }
    }
}