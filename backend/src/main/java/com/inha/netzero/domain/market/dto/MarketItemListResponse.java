package com.inha.netzero.domain.market.dto;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.inha.netzero.domain.market.entity.MarketItem;
import com.inha.netzero.domain.market.entity.TradeType;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MarketItemListResponse(
        Long itemId,
        TradeType tradeType,
        String title,
        Integer price,
        String thumbnailUrl,
        Integer heartCount,
        Instant createdAt,
        String content,
        AuthorResponse author
) {

    public static MarketItemListResponse fromSell(MarketItem item, String thumbnailUrl) {
        return new MarketItemListResponse(
                item.getId(),
                item.getTradeType(),
                item.getTitle(),
                item.getPrice(),
                thumbnailUrl,
                item.getHeartCount(),
                item.getCreatedAt(),
                null,
                null);
    }

    public static MarketItemListResponse fromBuy(MarketItem item) {
        return new MarketItemListResponse(
                item.getId(),
                item.getTradeType(),
                item.getTitle(),
                null,
                null,
                null,
                null,
                item.getContent(),
                AuthorResponse.from(item.getSeller()));
    }
}
