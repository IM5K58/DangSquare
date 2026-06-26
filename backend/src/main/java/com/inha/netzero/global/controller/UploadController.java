package com.inha.netzero.global.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.inha.netzero.global.dto.PresignRequest;
import com.inha.netzero.global.dto.PresignResponse;
import com.inha.netzero.global.response.ApiResponse;
import com.inha.netzero.global.service.UploadService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final UploadService uploadService;

    public UploadController(UploadService uploadService) {
        this.uploadService = uploadService;
    }

    @PostMapping("/presign")
    public ApiResponse<PresignResponse> presign(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody PresignRequest request) {
        return ApiResponse.success(uploadService.generatePresignedUrl(request));
    }
}
