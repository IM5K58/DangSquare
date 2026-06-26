package com.inha.netzero.domain.market.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * 중고거래 글 이미지(S3 URL). sortOrder=0 이 대표 이미지.
 */
@Entity
@Table(name = "market_item_image")
public class MarketItemImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id")
    private MarketItem item;

    @Column(nullable = false)
    private String url;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    protected MarketItemImage() {
        // JPA
    }

    public MarketItemImage(String url, int sortOrder) {
        this.url = url;
        this.sortOrder = sortOrder;
    }

    /** MarketItem.addImage 에서 양방향 연관관계를 맞추기 위해 호출한다. */
    void assignItem(MarketItem item) {
        this.item = item;
    }

    public Long getId() {
        return id;
    }

    public MarketItem getItem() {
        return item;
    }

    public String getUrl() {
        return url;
    }

    public int getSortOrder() {
        return sortOrder;
    }
}
