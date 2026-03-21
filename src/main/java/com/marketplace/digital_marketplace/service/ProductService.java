package com.marketplace.digital_marketplace.service;

import com.marketplace.digital_marketplace.dto.BuyResponse;
import com.marketplace.digital_marketplace.dto.ProductRequest;
import com.marketplace.digital_marketplace.dto.ProductResponse;
import com.marketplace.digital_marketplace.entity.Product;
import com.marketplace.digital_marketplace.entity.Product.ProductStatus;
import com.marketplace.digital_marketplace.entity.User;
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

        // 6. Mark product as SOLD
        product.setStatus(ProductStatus.SOLD);
        productRepository.save(product);

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
}