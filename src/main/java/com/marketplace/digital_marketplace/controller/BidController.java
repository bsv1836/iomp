package com.marketplace.digital_marketplace.controller;

import com.marketplace.digital_marketplace.dto.BidRequest;
import com.marketplace.digital_marketplace.dto.BidResponse;
import com.marketplace.digital_marketplace.service.BidService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;

    // ─── POST /api/bids/{productId} — Place a bid (auth required) ───
    @PostMapping("/{productId}")
    public ResponseEntity<?> placeBid(
            @PathVariable Long productId,
            @RequestBody BidRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            BidResponse response = bidService.placeBid(
                    productId, request, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─── GET /api/bids/{productId}/highest — Highest bid (public) ───
    @GetMapping("/{productId}/highest")
    public ResponseEntity<?> getHighestBid(@PathVariable Long productId) {
        try {
            BidResponse response = bidService.getHighestBid(productId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─── GET /api/bids/{productId}/history — Bid history (seller only)
    @GetMapping("/{productId}/history")
    public ResponseEntity<?> getBidHistory(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<BidResponse> history = bidService.getBidHistory(
                    productId, userDetails.getUsername());
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("FORBIDDEN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied. Only the seller can view bid history.");
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─── GET /api/bids/my-bids — My bids (auth required) ────────────
    @GetMapping("/my-bids")
    public ResponseEntity<?> getMyBids(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<BidResponse> bids = bidService.getMyBids(
                    userDetails.getUsername());
            return ResponseEntity.ok(bids);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}