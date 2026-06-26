package com.inha.netzero.global.dto;

import jakarta.validation.constraints.NotBlank;

public record PresignRequest(
        @NotBlank String fileName,
        @NotBlank String contentType
) {
}
