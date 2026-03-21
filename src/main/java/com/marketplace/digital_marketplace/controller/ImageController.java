package com.marketplace.digital_marketplace.controller;

import com.marketplace.digital_marketplace.entity.Product;
import com.marketplace.digital_marketplace.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ProductRepository productRepository;

    // Directory where images will be stored
    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping("/upload/{productId}")
    public ResponseEntity<?> uploadImage(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file) {

        try {
            // Create uploads folder if it doesn't exist
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Generate unique filename
            String extension = file.getOriginalFilename()
                    .substring(file.getOriginalFilename().lastIndexOf("."));;
            String filename = UUID.randomUUID().toString() + extension;

            // Save file to disk
            Path filePath = Paths.get(UPLOAD_DIR + filename);
            Files.write(filePath, file.getBytes());

            // Update product imagePath in database
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            product.setImagePath("/uploads/" + filename);
            productRepository.save(product);

            return ResponseEntity.ok("/uploads/" + filename);

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("Failed to upload image: " + e.getMessage());
        }
    }
}