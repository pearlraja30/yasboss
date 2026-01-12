package com.yasboss.security.oauth2;

import com.yasboss.security.JwtUtils; // ✨ Use JwtUtils here
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtils jwtUtils; // ✨ Inject updated JwtUtils

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, 
                                        Authentication authentication) throws IOException, ServletException {
        
        String targetUrl = "http://localhost:5173/oauth2/redirect";
        
        // 1. Generate JWT Token using the new method we added to JwtUtils
        String token = jwtUtils.generateToken(authentication);

        // 2. Build redirect URL
        String finalUrl = UriComponentsBuilder.fromUriString(targetUrl)
                .queryParam("token", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, finalUrl);
    }
}