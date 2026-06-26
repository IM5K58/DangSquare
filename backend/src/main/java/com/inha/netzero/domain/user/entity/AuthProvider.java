package com.inha.netzero.domain.user.entity;

/**
 * 인증 제공자. MVP는 GOOGLE(OAuth2)만 사용. LOCAL은 향후 이메일/비밀번호 가입 대비.
 */
public enum AuthProvider {
    GOOGLE,
    LOCAL
}
