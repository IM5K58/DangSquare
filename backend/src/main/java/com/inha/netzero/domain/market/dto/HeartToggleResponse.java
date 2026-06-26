package com.inha.netzero.domain.market.dto;

public record HeartToggleResponse(
        boolean hearted,
        int heartCount
) {
}
