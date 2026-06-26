package com.inha.netzero.domain.market.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.inha.netzero.domain.market.entity.MarketCategory;
import com.inha.netzero.domain.market.entity.MarketItem;
import com.inha.netzero.domain.market.entity.MarketItemStatus;
import com.inha.netzero.domain.market.entity.TradeType;

public interface MarketItemRepository extends JpaRepository<MarketItem, Long> {

    @EntityGraph(attributePaths = "seller")
    @Query("""
            select m from MarketItem m
            where (:tradeType is null or m.tradeType = :tradeType)
              and (:category is null or m.category = :category)
              and (:status is null or m.status = :status)
            """)
    Page<MarketItem> search(@Param("tradeType") TradeType tradeType,
                            @Param("category") MarketCategory category,
                            @Param("status") MarketItemStatus status,
                            Pageable pageable);

    @EntityGraph(attributePaths = {"seller", "images"})
    Optional<MarketItem> findWithImagesById(Long id);
}
