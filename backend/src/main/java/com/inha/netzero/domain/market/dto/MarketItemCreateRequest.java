package com.inha.netzero.domain.market.dto;

import java.util.List;

import com.inha.netzero.domain.market.entity.MarketCategory;
import com.inha.netzero.domain.market.entity.TradeType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record MarketItemCreateRequest(
        @NotNull TradeType tradeType,
        @NotNull MarketCategory category,
        @NotBlank String title,
        String content,
        @PositiveOrZero Integer price,
        List<String> imageUrls
) {
}
