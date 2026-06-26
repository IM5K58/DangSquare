package com.inha.netzero.domain.market.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.inha.netzero.domain.market.entity.MarketItem;
import com.inha.netzero.domain.market.entity.MarketItemHeart;
import com.inha.netzero.domain.user.entity.User;

public interface MarketItemHeartRepository extends JpaRepository<MarketItemHeart, Long> {

    Optional<MarketItemHeart> findByItemAndUser(MarketItem item, User user);

    boolean existsByItemAndUser(MarketItem item, User user);
}
