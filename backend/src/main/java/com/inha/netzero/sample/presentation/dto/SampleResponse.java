package com.inha.netzero.sample.presentation.dto;

import java.time.Instant;

import com.inha.netzero.sample.domain.Sample;

/**
 * Sample 응답 DTO. 엔티티를 직접 노출하지 않고 변환해서 반환한다.
 */
public record SampleResponse(
        Long id,
        String name,
        Instant createdAt
) {
    public static SampleResponse from(Sample sample) {
        return new SampleResponse(sample.getId(), sample.getName(), sample.getCreatedAt());
    }
}
