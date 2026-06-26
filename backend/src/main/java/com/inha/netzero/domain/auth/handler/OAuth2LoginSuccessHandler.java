package com.inha.netzero.domain.auth.handler;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.inha.netzero.domain.auth.model.CustomOAuth2User;
import com.inha.netzero.global.security.JwtTokenProvider;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * OAuth2 로그인 성공 시 우리 JWT 를 발급하고 프론트엔드로 리다이렉트한다.
 * 온보딩 전(신규) 사용자는 온보딩 화면으로, 온보딩 완료 사용자는 홈으로 보낸다.
 * 토큰은 쿼리 파라미터로 전달하고, 프론트는 이를 저장 후 라우팅한다.
 */
@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final String redirectUri;
    private final String onboardingPath;
    private final String homePath;

    public OAuth2LoginSuccessHandler(JwtTokenProvider jwtTokenProvider,
                                     @Value("${app.oauth2.redirect-uri}") String redirectUri,
                                     @Value("${app.oauth2.onboarding-path}") String onboardingPath,
                                     @Value("${app.oauth2.home-path}") String homePath) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.redirectUri = redirectUri;
        this.onboardingPath = onboardingPath;
        this.homePath = homePath;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        CustomOAuth2User principal = (CustomOAuth2User) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(principal.getUserId());
        String path = principal.isOnboarded() ? homePath : onboardingPath;

        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .path(path)
                .queryParam("token", token)
                .queryParam("onboarded", principal.isOnboarded())
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
