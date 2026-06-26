package com.inha.netzero.global.dto;

import com.inha.netzero.global.storage.S3PresignResult;

public record PresignResponse(
        String uploadUrl,
        String fileUrl,
        long expiresInSeconds
) {

    public static PresignResponse from(S3PresignResult result) {
        return new PresignResponse(result.uploadUrl(), result.fileUrl(), result.expiresInSeconds());
    }
}
