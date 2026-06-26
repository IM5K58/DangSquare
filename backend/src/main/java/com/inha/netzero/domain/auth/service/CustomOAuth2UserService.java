package com.inha.netzero.domain.auth.service;

import java.util.Map;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.inha.netzero.domain.auth.model.CustomOAuth2User;
import com.inha.netzero.domain.user.entity.User;
import com.inha.netzero.domain.user.service.UserService;

/**
 * Google OAuth2 로그인 시 사용자 정보를 받아 우리 User 를 find-or-create 하고
 * CustomOAuth2User principal 로 변환한다.
 */
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserService userService;

    public CustomOAuth2UserService(UserService userService) {
        this.userService = userService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String providerId = (String) attributes.get("sub");
        String picture = (String) attributes.get("picture");

        User user = userService.findOrCreateGoogleUser(email, providerId, picture);
        return new CustomOAuth2User(user.getId(), user.getEmail(), user.isOnboarded(), attributes);
    }
}
