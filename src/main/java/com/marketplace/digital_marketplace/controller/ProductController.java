package com.marketplace.digital_marketplace.controller;

import com.marketplace.digital_marketplace.dto.BuyResponse;
import com.marketplace.digital_marketplace.dto.ProductRequest;
import com.marketplace.digital_marketplace.dto.ProductResponse;
import com.marketplace.digital_marketplace.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // ─── Bhanu's existing endpoints (unchanged) ──────────────────────

    @PostMapping
    public ResponseEntity<ProductResponse> listProduct(
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ProductResponse response = productService.listProduct(request, userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ProductResponse>> getMyProducts(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(productService.getMyProducts(userDetails));
    }

    // ─── New: Buy a Direct Sale Product (JWT required) ───────────────
    @PostMapping("/{productId}/buy")
    public ResponseEntity<?> buyProduct(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            BuyResponse response = productService.buyProduct(productId, userDetails);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}