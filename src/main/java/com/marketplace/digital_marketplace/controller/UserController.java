package com.marketplace.digital_marketplace.controller;

import com.marketplace.digital_marketplace.dto.LoginRequestDTO;
import com.marketplace.digital_marketplace.dto.RegisterRequestDTO;
import com.marketplace.digital_marketplace.entity.Notification;
import com.marketplace.digital_marketplace.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ─── Register ────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequestDTO request) {
        return ResponseEntity.ok(userService.registerUser(request));
    }

    // ─── Login ───────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequestDTO request) {
        try {
            return ResponseEntity.ok(userService.loginUser(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─── Get Profile ─────────────────────────────────────────────────
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails));
    }

    // ─── Update Profile ──────────────────────────────────────────────
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> updates) {
        return ResponseEntity.ok(userService.updateProfile(userDetails, updates));
    }

    // ─── Get Notifications ───────────────────────────────────────────
    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getNotifications(userDetails));
    }

    // ─── Mark All Notifications Read ─────────────────────────────────
    @PutMapping("/notifications/read")
    public ResponseEntity<?> markAllRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        userService.markAllNotificationsRead(userDetails);
        return ResponseEntity.ok("All notifications marked as read");
    }

    // ─── Update Profile Photo (500x500) ──────────────────────────────
    @PutMapping("/profile/photo")
    public ResponseEntity<?> updateProfilePhoto(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.updateProfilePhoto(userDetails, file));
    }
}