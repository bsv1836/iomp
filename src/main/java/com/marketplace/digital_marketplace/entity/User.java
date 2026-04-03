package com.marketplace.digital_marketplace.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private String role;

    // ─── New Fields ──────────────────────────────────────────────────
    @Column(length = 15, nullable = true)
    private String mobile;

    @Column(length = 100)
    private String location;

    @Column(name = "profile_photo", length = 500)
    private String profilePhoto;
}