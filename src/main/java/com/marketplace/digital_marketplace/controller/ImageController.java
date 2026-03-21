package com.marketplace.digital_marketplace.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.marketplace.digital_marketplace.entity.Product;
import com.marketplace.digital_marketplace.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ProductRepository productRepository;
    private final Cloudinary cloudinary;

    @PostMapping("/upload/{productId}")
    public ResponseEntity<?> uploadImage(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file) {

        try {
            // Upload to Cloudinary
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "digital-marketplace",
                            "resource_type", "image"
                    )
            );

            // Get the secure URL from Cloudinary
            String imageUrl = (String) uploadResult.get("secure_url");

            // Update product imagePath in database
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            product.setImagePath(imageUrl);
            productRepository.save(product);

            return ResponseEntity.ok(imageUrl);

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("Failed to upload image: " + e.getMessage());
        }
    }
}