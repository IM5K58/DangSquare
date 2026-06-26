package com.inha.netzero.domain.market.entity;

import java.util.ArrayList;
import java.util.List;

import com.inha.netzero.domain.user.entity.User;
import com.inha.netzero.global.entity.BaseTimeEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

/**
 * 중고거래 글. tradeType 에 따라 사용 필드가 다르다(SELL: price/images, BUY: 제목/내용).
 * heartCount 는 MarketItemHeart 개수의 캐시 값이다.
 */
@Entity
@Table(name = "market_item",
        indexes = @Index(name = "idx_market_item_filter",
                columnList = "trade_type, category, status, created_at"))
public class MarketItem extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id")
    private User seller;

    @Enumerated(EnumType.STRING)
    @Column(name = "trade_type", nullable = false)
    private TradeType tradeType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MarketCategory category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String content;

    /** SELL 만 사용(BUY 는 null). */
    private Integer price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MarketItemStatus status = MarketItemStatus.ON_SALE;

    @Column(nullable = false)
    private int heartCount = 0;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<MarketItemImage> images = new ArrayList<>();

    protected MarketItem() {
        // JPA
    }

    public MarketItem(User seller, TradeType tradeType, MarketCategory category,
                      String title, String content, Integer price) {
        this.seller = seller;
        this.tradeType = tradeType;
        this.category = category;
        this.title = title;
        this.content = content;
        this.price = price;
    }

    public void addImage(MarketItemImage image) {
        this.images.add(image);
        image.assignItem(this);
    }

    public void markSold() {
        this.status = MarketItemStatus.SOLD;
    }

    public void increaseHeart() {
        this.heartCount++;
    }

    public void decreaseHeart() {
        if (this.heartCount > 0) {
            this.heartCount--;
        }
    }

    public Long getId() {
        return id;
    }

    public User getSeller() {
        return seller;
    }

    public TradeType getTradeType() {
        return tradeType;
    }

    public MarketCategory getCategory() {
        return category;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public Integer getPrice() {
        return price;
    }

    public MarketItemStatus getStatus() {
        return status;
    }

    public int getHeartCount() {
        return heartCount;
    }

    public List<MarketItemImage> getImages() {
        return images;
    }
}
