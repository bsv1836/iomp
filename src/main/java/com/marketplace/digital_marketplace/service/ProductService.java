package com.marketplace.digital_marketplace.service;

import com.marketplace.digital_marketplace.dto.ContactResponse;
import com.marketplace.digital_marketplace.dto.BuyResponse;
import com.marketplace.digital_marketplace.dto.ProductRequest;
import com.marketplace.digital_marketplace.dto.ProductResponse;
import com.marketplace.digital_marketplace.entity.Notification;
import com.marketplace.digital_marketplace.entity.Product;
import com.marketplace.digital_marketplace.entity.Product.ProductStatus;
import com.marketplace.digital_marketplace.entity.User;
import com.marketplace.digital_marketplace.repository.NotificationRepository;
import com.marketplace.digital_marketplace.repository.ProductRepository;
import com.marketplace.digital_marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public ProductResponse listProduct(ProductRequest request, UserDetails userDetails) {
        User seller = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        Product product = Product.builder()
                .seller(seller)
                .name(request.getName())
                .description(request.getDescription())
                .startingPrice(request.getStartingPrice())
                .currentPrice(request.getStartingPrice())
                .bidIncrement(request.getBidIncrement() != null ? request.getBidIncrement() : 0.0)
                .auctionEndTime(request.getAuctionEndTime())
                .saleType(request.getSaleType())
                .status(ProductStatus.ACTIVE)
                .category(request.getCategory())
                .brand(request.getBrand())
                .productCondition(request.getProductCondition())
                .damages(request.getDamages())
                .location(request.getLocation())
                .purchaseMonth(request.getPurchaseMonth())
                .purchaseYear(request.getPurchaseYear())
                .warrantyRemaining(request.getWarrantyRemaining())
                .build();

        return ProductResponse.from(productRepository.save(product));
    }

    public List<ProductResponse> getAllActiveProducts() {
        return productRepository.findByStatus(ProductStatus.ACTIVE)
                .stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return ProductResponse.from(product);
    }

    public List<ProductResponse> getMyProducts(UserDetails userDetails) {
        User seller = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return productRepository.findBySeller(seller)
                .stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());
    }

    // ─── Buy a Direct Sale Product ───────────────────────────────────
    public BuyResponse buyProduct(Long productId, UserDetails userDetails) {

        // 1. Fetch product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 2. Must be DIRECT sale type
        if (product.getSaleType() != Product.SaleType.DIRECT) {
            throw new RuntimeException(
                    "This product is an auction. Use the bid endpoint instead.");
        }

        // 3. Fetch buyer
        User buyer = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        // 4. Buyer must NOT be the seller (check BEFORE status check)
        if (product.getSeller().getId().equals(buyer.getId())) {
            throw new RuntimeException("You cannot buy your own product.");
        }

        // 5. Must be ACTIVE
        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new RuntimeException(
                    "This product is no longer available for purchase.");
        }

        // 6. Mark product as PENDING (waiting for seller confirmation)
        product.setStatus(ProductStatus.PENDING);
        product.setWinnerId(buyer.getId());
        productRepository.save(product);

        // 7. Notify the seller
        Notification notification = Notification.builder()
                .user(product.getSeller())
                .message(buyer.getName() + " wants to buy " + product.getName() + ". Please confirm the sale in your profile.")
                .productId(product.getProductId())
                .read(false)
                .build();
        notificationRepository.save(notification);

        return new BuyResponse(
                product.getProductId(),
                product.getName(),
                product.getCurrentPrice(),
                buyer.getId(),
                buyer.getName(),
                "Purchase successful! You bought " + product.getName(),
                LocalDateTime.now()
        );
    }
    // ─── Get Unavailable Products (SOLD + EXPIRED) ───────────────────
    public List<ProductResponse> getUnavailableProducts() {
        return productRepository.findByStatusIn(
                        java.util.List.of(
                                Product.ProductStatus.SOLD,
                                Product.ProductStatus.EXPIRED,
                                Product.ProductStatus.PENDING
                        ))
                .stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());
    }

    // ─── Confirm Sale (seller only) ──────────────────────────────────
    public String confirmSale(Long productId, UserDetails userDetails) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Only seller can confirm
        User seller = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("Only the seller can confirm the sale");
        }

        // Must be PENDING status
        if (product.getStatus() != Product.ProductStatus.PENDING) {
            throw new RuntimeException("Product is not in PENDING status");
        }

        // Mark as SOLD
        product.setStatus(Product.ProductStatus.SOLD);
        productRepository.save(product);

        // Notify the buyer
        User buyer = userRepository.findById(product.getWinnerId()).orElse(null);
        if (buyer != null) {
            Notification notification = Notification.builder()
                    .user(buyer)
                    .message("Congratulations! The seller confirmed your purchase of " + product.getName() + ". View the contacts in the product details.")
                    .productId(product.getProductId())
                    .read(false)
                    .build();
            notificationRepository.save(notification);
        }

        return "Sale confirmed successfully";
    }
    // ─── Get Products Won by User ────────────────────────────────────
    public List<ProductResponse> getWonProducts(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return productRepository.findByWinnerIdAndStatus(
                        user.getId(), Product.ProductStatus.SOLD)
                .stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());
    }
    // ─── Get Contact Details (seller or winner only) ─────────────────
    public ContactResponse getContacts(Long productId, UserDetails userDetails) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStatus() != Product.ProductStatus.SOLD) {
            throw new RuntimeException("Contacts are only available after sale is confirmed");
        }

        User requester = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        User seller = product.getSeller();

        User winner = userRepository.findById(product.getWinnerId())
                .orElseThrow(() -> new RuntimeException("Winner not found"));

        boolean isSeller = seller.getId().equals(requester.getId());
        boolean isWinner = winner.getId().equals(requester.getId());

        if (!isSeller && !isWinner) {
            throw new RuntimeException("You are not authorized to view contact details");
        }

        return new ContactResponse(
                seller.getName(), seller.getEmail(), seller.getMobile(),
                winner.getName(), winner.getEmail(), winner.getMobile()
        );
    }
}