package com.yasboss.security.oauth2;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

import com.yasboss.model.User;
import com.yasboss.repository.UserRepository;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        return processOAuth2User(userRequest, oAuth2User);
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        // Fallback for providers like Twitter/X or GitHub that might hide email
        if (email == null) {
            email = (String) attributes.get("login") + "@" + registrationId + ".com";
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
        } else {
            user = new User();
            user.setEmail(email);
            user.setRole("CUSTOMER"); // Default role
            user.setRewardPoints(100); // Welcome bonus
        }

        // Standardize details from different providers
        user.setFullName(extractName(attributes, registrationId));
        user.setProfileImage(extractPicture(attributes, registrationId));
        user.setProvider(registrationId); // To track if they are Google, FB, etc.

        userRepository.save(user);
        return oAuth2User;
    }

    private String extractName(Map<String, Object> attr, String id) {
        if (id.equals("google") || id.equals("facebook")) return (String) attr.get("name");
        if (id.equals("github")) return (String) attr.get("login");
        if (id.equals("twitter")) return (String) attr.get("screen_name");
        return "Explorer";
    }

    private String extractPicture(Map<String, Object> attr, String id) {
        if (id.equals("google")) return (String) attr.get("picture");
        if (id.equals("facebook")) {
            Map<String, Object> data = (Map<String, Object>) attr.get("picture");
            Map<String, Object> urlData = (Map<String, Object>) data.get("data");
            return (String) urlData.get("url");
        }
        if (id.equals("github")) return (String) attr.get("avatar_url");
        return null;
    }
}