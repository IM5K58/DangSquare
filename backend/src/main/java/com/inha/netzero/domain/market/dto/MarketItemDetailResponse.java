package com.inha.netzero.domain.market.dto;

import java.time.Instant;
import java.util.List;

import com.inha.netzero.domain.market.entity.MarketItem;
import com.inha.netzero.domain.market.entity.MarketItemStatus;
import com.inha.netzero.domain.market.entity.TradeType;

public record MarketItemDetailResponse(
        Long itemId,
        TradeType tradeType,
        String title,
        Integer price,
        List<String> images,
        int heartCount,
        boolean hearted,
        MarketItemStatus status,
        String content,
        Instant createdAt,
        AuthorResponse author
) {

    public static MarketItemDetailResponse from(MarketItem item, List<String> imageUrls, boolean hearted) {
        return new MarketItemDetailResponse(
                item.getId(),
                item.getTradeType(),
                item.getTitle(),
                item.getPrice(),
                imageUrls,
                item.getHeartCount(),
                hearted,
                item.getStatus(),
                item.getContent(),
                item.getCreatedAt(),
                AuthorResponse.from(item.getSeller()));
    }
}
