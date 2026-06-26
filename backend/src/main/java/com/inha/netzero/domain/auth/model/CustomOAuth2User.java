package com.inha.netzero.domain.auth.model;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

/**
 * OAuth2 인증 후 우리 도메인 식별자(userId)와 온보딩 여부를 담는 principal.
 * 성공 핸들러가 이 정보를 읽어 JWT 발급 및 리다이렉트 분기를 한다.
 */
public class CustomOAuth2User implements OAuth2User {

    private final Long userId;
    private final String email;
    private final boolean onboarded;
    private final Map<String, Object> attributes;

    public CustomOAuth2User(Long userId, String email, boolean onboarded, Map<String, Object> attributes) {
        this.userId = userId;
        this.email = email;
        this.onboarded = onboarded;
        this.attributes = attributes;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getName() {
        return String.valueOf(userId);
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public boolean isOnboarded() {
        return onboarded;
    }
}
