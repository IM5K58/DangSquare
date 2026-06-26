package com.inha.netzero.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 프론트엔드(Next.js)가 백엔드를 직접 호출하는 경우를 위한 CORS 설정.
 * 개발 시에는 Next.js rewrites 프록시를 쓰므로 보통 필요 없지만,
 * 운영에서 프론트/백을 별도 도메인으로 분리 배포할 때를 대비한 안전망.
 * 허용 오리진은 application.yaml 의 app.cors.allowed-origins 로 주입한다.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;

    public CorsConfig(@Value("${app.cors.allowed-origins}") String[] allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
