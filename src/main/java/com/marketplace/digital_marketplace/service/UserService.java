package com.marketplace.digital_marketplace.service;

import com.marketplace.digital_marketplace.config.JwtUtil;
import com.marketplace.digital_marketplace.dto.RegisterRequestDTO;
import com.marketplace.digital_marketplace.dto.LoginRequestDTO;
import com.marketplace.digital_marketplace.entity.User;
import com.marketplace.digital_marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public String registerUser(RegisterRequestDTO request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        userRepository.save(user);
        return "User registered successfully";
    }

    public String loginUser(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtUtil.generateToken(user.getEmail());
    }
}