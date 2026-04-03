package com.marketplace.digital_marketplace.config;

import com.marketplace.digital_marketplace.entity.User;
import com.marketplace.digital_marketplace.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = oAuth2User.getAttribute("email");

            log.info("OAuth2 success. Email from Google: {}", email);

            if (email == null) {
                log.error("Email attribute missing from OAuth2 user");
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Email not found from Google");
                return;
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found after OAuth2 login: " + email));

            String token = jwtUtil.generateToken(user.getEmail());

            String name = user.getName() != null ? user.getName() : "";
            String encodedName = URLEncoder.encode(name, StandardCharsets.UTF_8);

            String frontendUrl = System.getenv().getOrDefault("FRONTEND_URL", "http://localhost:5173");
            String targetUrl = frontendUrl + "/oauth2/callback?token=" + token + "&name=" + encodedName;

            log.info("Redirecting OAuth2 user to: {}", targetUrl);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);

        } catch (Exception e) {
            log.error("OAuth2 success handler failed: {}", e.getMessage(), e);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "OAuth2 login failed: " + e.getMessage());
        }
    }
}
