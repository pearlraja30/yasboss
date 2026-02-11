package com.yasboss.security.oauth2;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired; // Assuming you have a Role entity or Enum
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.yasboss.model.Role;
import com.yasboss.model.User;
import com.yasboss.repository.RoleRepository;
import com.yasboss.repository.UserRepository;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository; // To fetch the CUSTOMER role

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);
        return processOAuth2User(oAuth2UserRequest, oAuth2User);
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        
        if (userOptional.isPresent()) {
            user = userOptional.get();
        } else {
            // ✨ New Social User Registration
            user = registerNewSocialUser(oAuth2UserRequest, oAuth2User);
        }

        return oAuth2User;
    }

   private User registerNewSocialUser(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        User user = new User();
        user.setEmail(oAuth2User.getAttribute("email"));
        user.setFullName(oAuth2User.getAttribute("name"));
        user.setProvider(oAuth2UserRequest.getClientRegistration().getRegistrationId());
        user.setEnabled(true);

        // ✨ This matches the Set<Role> in your User model
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Default Role ROLE_CUSTOMER not found in DB"));
        
        user.getRoles().add(customerRole); 

        return userRepository.save(user);
    }
}