package com.marketplace.digital_marketplace.config;

import com.marketplace.digital_marketplace.entity.User;
import com.marketplace.digital_marketplace.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        log.info("Processing OAuth2 login for email: {}", email);

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        try {
            userRepository.findByEmail(email).orElseGet(() -> {
                log.info("New Google user — registering: {}", email);
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setName(name != null ? name : "Google User");
                newUser.setRole("USER");
                // Placeholder password — Google users never use it
                newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                // Mobile is now optional at registration
                // Set Google profile picture if available
                String picture = oAuth2User.getAttribute("picture");
                if (picture != null) {
                    newUser.setProfilePhoto(picture);
                }
                return userRepository.save(newUser);
            });
        } catch (Exception e) {
            log.error("Failed to save/find OAuth2 user: {}", e.getMessage(), e);
            throw new OAuth2AuthenticationException("Could not register/find user: " + e.getMessage());
        }

        return oAuth2User;
    }
}
