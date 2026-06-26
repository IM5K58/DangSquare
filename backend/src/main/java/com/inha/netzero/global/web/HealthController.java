package com.inha.netzero.global.web;

import java.time.Instant;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.inha.netzero.global.response.ApiResponse;

/**
 * 프론트↔백 연결 확인용 엔드포인트 (DB 불필요).
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ApiResponse<Map<String, Object>> health() {
        return ApiResponse.success(Map.of(
                "status", "UP",
                "service", "netzero",
                "time", Instant.now().toString()
        ));
    }
}
