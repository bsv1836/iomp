package com.marketplace.digital_marketplace.controller;

import com.marketplace.digital_marketplace.dto.LoginRequestDTO;
import com.marketplace.digital_marketplace.dto.RegisterRequestDTO;
import com.marketplace.digital_marketplace.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public String registerUser(@RequestBody RegisterRequestDTO request) {
        return userService.registerUser(request);
    }

    @PostMapping("/login")
    public String loginUser(@RequestBody LoginRequestDTO request) {
        return userService.loginUser(request);
    }
}