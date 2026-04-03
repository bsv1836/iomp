package com.marketplace.digital_marketplace.service;

import com.marketplace.digital_marketplace.config.JwtUtil;
import com.marketplace.digital_marketplace.dto.RegisterRequestDTO;
import com.marketplace.digital_marketplace.dto.LoginRequestDTO;
import com.marketplace.digital_marketplace.entity.Notification;
import com.marketplace.digital_marketplace.entity.Product;
import com.marketplace.digital_marketplace.entity.User;
import com.marketplace.digital_marketplace.repository.NotificationRepository;
import com.marketplace.digital_marketplace.repository.ProductRepository;
import com.marketplace.digital_marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final NotificationRepository notificationRepository;
    private final ProductRepository productRepository;
    private final Cloudinary cloudinary;

    // ─── Register ────────────────────────────────────────────────────
    public String registerUser(RegisterRequestDTO request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setMobile(request.getMobile());
        userRepository.save(user);
        return "User registered successfully";
    }

    // ─── Login ───────────────────────────────────────────────────────
    public Map<String, Object> loginUser(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("name", user.getName());
        response.put("id", user.getId());
        response.put("profilePhoto", user.getProfilePhoto());
        return response;
    }

    // ─── Get Profile ─────────────────────────────────────────────────
    public Map<String, Object> getProfile(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Products listed by user
        List<Product> listedProducts = productRepository.findBySeller(user);

        // Products won/bought by user
        List<Product> wonProducts = productRepository
                .findByWinnerIdAndStatus(user.getId(), Product.ProductStatus.SOLD);

        // Unread notification count
        long unreadCount = notificationRepository.countByUserAndReadFalse(user);

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("mobile", user.getMobile());
        profile.put("location", user.getLocation());
        profile.put("profilePhoto", user.getProfilePhoto());
        profile.put("listedProducts", listedProducts.size());
        profile.put("wonProducts", wonProducts.size());
        profile.put("unreadNotifications", unreadCount);
        return profile;
    }

    // ─── Update Profile ──────────────────────────────────────────────
    public Map<String, Object> updateProfile(UserDetails userDetails,
                                             Map<String, String> updates) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.containsKey("name")) user.setName(updates.get("name"));
        if (updates.containsKey("mobile")) user.setMobile(updates.get("mobile"));
        if (updates.containsKey("location")) user.setLocation(updates.get("location"));
        if (updates.containsKey("profilePhoto"))
            user.setProfilePhoto(updates.get("profilePhoto"));

        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Profile updated successfully");
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("mobile", user.getMobile());
        response.put("location", user.getLocation());
        response.put("profilePhoto", user.getProfilePhoto());
        return response;
    }

    // ─── Get Notifications ───────────────────────────────────────────
    public List<Notification> getNotifications(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    // ─── Mark Notifications as Read ──────────────────────────────────
    public void markAllNotificationsRead(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Notification> unread = notificationRepository
                .findByUserAndReadFalseOrderByCreatedAtDesc(user);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    // ─── Update Profile Photo (500x500) ──────────────────────────────
    public String updateProfilePhoto(UserDetails userDetails, MultipartFile file) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            // Upload to Cloudinary with 500x500 square crop
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "profiles",
                            "transformation", "w_500,h_500,c_fill,g_face"
                    )
            );

            String imageUrl = (String) uploadResult.get("secure_url");
            user.setProfilePhoto(imageUrl);
            userRepository.save(user);

            return imageUrl;

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload profile photo: " + e.getMessage());
        }
    }
}