package com.inha.netzero.ai.dto;

import java.util.List;

public class RecommendationResult {

    private final List<Item> recommendations;

    public RecommendationResult(List<Item> recommendations) {
        this.recommendations = recommendations;
    }

    public static RecommendationResult empty() {
        return new RecommendationResult(List.of());
    }

    public List<Item> getRecommendations() { return recommendations; }

    public static class Item {
        private final Long productId;
        private final String reason;

        public Item(Long productId, String reason) {
            this.productId = productId;
            this.reason = reason;
        }

        public Long getProductId() { return productId; }
        public String getReason() { return reason; }
    }
}
