package com.inha.netzero.ai.dto;

public class SellDraftResult {

    private final String title;
    private final String description;
    private final Integer suggestedPrice;
    private final String suggestedCategory;

    public SellDraftResult(String title, String description, Integer suggestedPrice, String suggestedCategory) {
        this.title = title;
        this.description = description;
        this.suggestedPrice = suggestedPrice;
        this.suggestedCategory = suggestedCategory;
    }

    /** 폴백 빈 초안. */
    public static SellDraftResult empty() {
        return new SellDraftResult("", "", null, "ETC");
    }

    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Integer getSuggestedPrice() { return suggestedPrice; }
    public String getSuggestedCategory() { return suggestedCategory; }
}
