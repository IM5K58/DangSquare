package com.inha.netzero.domain.marketplace.entity;

import com.inha.netzero.global.entity.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * 저탄소 마켓 상품. 운영자/시드로 큐레이션된다(사용자 등록 없음). 별점/개수는 시드값.
 * lowCarbonSummary("왜 저탄소인지")는 시드 적재 시 LLM 으로 1회 생성·캐싱한다.
 */
@Entity
@Table(name = "marketplace_product")
public class MarketplaceProduct extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String title;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MarketplaceCategory category;

    @Column(nullable = false)
    private double rating;

    @Column(nullable = false)
    private int ratingCount;

    @Column(nullable = false)
    private int price;

    /** LLM 으로 1회 생성·캐싱되는 저탄소 한 줄 요약. */
    @Column(columnDefinition = "text")
    private String lowCarbonSummary;

    protected MarketplaceProduct() {
        // JPA
    }

    public MarketplaceProduct(String company, String title, String imageUrl,
                              MarketplaceCategory category, double rating, int ratingCount, int price) {
        this.company = company;
        this.title = title;
        this.imageUrl = imageUrl;
        this.category = category;
        this.rating = rating;
        this.ratingCount = ratingCount;
        this.price = price;
    }

    public void cacheLowCarbonSummary(String summary) {
        this.lowCarbonSummary = summary;
    }

    public Long getId() {
        return id;
    }

    public String getCompany() {
        return company;
    }

    public String getTitle() {
        return title;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public MarketplaceCategory getCategory() {
        return category;
    }

    public double getRating() {
        return rating;
    }

    public int getRatingCount() {
        return ratingCount;
    }

    public int getPrice() {
        return price;
    }

    public String getLowCarbonSummary() {
        return lowCarbonSummary;
    }
}
