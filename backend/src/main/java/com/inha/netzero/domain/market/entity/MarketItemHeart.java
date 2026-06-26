package com.inha.netzero.domain.market.entity;

import com.inha.netzero.domain.user.entity.User;
import com.inha.netzero.global.entity.BaseTimeEntity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * 하트(좋아요). (item, user) 쌍은 유일 — 사용자당 1회 토글. 토글 시 MarketItem.heartCount 동기화.
 */
@Entity
@Table(name = "market_item_heart",
        uniqueConstraints = @UniqueConstraint(name = "uk_market_item_heart",
                columnNames = {"item_id", "user_id"}))
public class MarketItemHeart extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id")
    private MarketItem item;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    protected MarketItemHeart() {
        // JPA
    }

    public MarketItemHeart(MarketItem item, User user) {
        this.item = item;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public MarketItem getItem() {
        return item;
    }

    public User getUser() {
        return user;
    }
}
