package com.inha.netzero.global.service;

import org.springframework.stereotype.Service;

import com.inha.netzero.global.dto.PresignRequest;
import com.inha.netzero.global.dto.PresignResponse;
import com.inha.netzero.global.exception.BusinessException;
import com.inha.netzero.global.exception.ErrorCode;
import com.inha.netzero.global.storage.S3StorageService;

@Service
public class UploadService {

    private static final String MARKET_IMAGE_PREFIX = "market";

    private final S3StorageService s3StorageService;

    public UploadService(S3StorageService s3StorageService) {
        this.s3StorageService = s3StorageService;
    }

    public PresignResponse generatePresignedUrl(PresignRequest request) {
        try {
            return PresignResponse.from(s3StorageService.presignUpload(
                    MARKET_IMAGE_PREFIX,
                    request.fileName(),
                    request.contentType()));
        } catch (RuntimeException e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "이미지 업로드 URL을 발급할 수 없습니다.");
        }
    }
}
