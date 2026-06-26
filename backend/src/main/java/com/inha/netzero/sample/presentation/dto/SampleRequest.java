package com.inha.netzero.sample.presentation.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Sample 생성 요청 DTO.
 */
public record SampleRequest(
        @NotBlank(message = "name은 비어 있을 수 없습니다.") String name
) {
}
