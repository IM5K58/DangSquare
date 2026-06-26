package com.inha.netzero.domain.market.service;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inha.netzero.domain.market.dto.HeartToggleResponse;
import com.inha.netzero.domain.market.dto.MarketItemCreateRequest;
import com.inha.netzero.domain.market.dto.MarketItemDetailResponse;
import com.inha.netzero.domain.market.dto.MarketItemListResponse;
import com.inha.netzero.domain.market.entity.MarketCategory;
import com.inha.netzero.domain.market.entity.MarketItem;
import com.inha.netzero.domain.market.entity.MarketItemHeart;
import com.inha.netzero.domain.market.entity.MarketItemImage;
import com.inha.netzero.domain.market.entity.MarketItemStatus;
import com.inha.netzero.domain.market.entity.TradeType;
import com.inha.netzero.domain.market.repository.MarketItemHeartRepository;
import com.inha.netzero.domain.market.repository.MarketItemRepository;
import com.inha.netzero.domain.user.entity.User;
import com.inha.netzero.domain.user.repository.UserRepository;
import com.inha.netzero.global.exception.BusinessException;
import com.inha.netzero.global.exception.ErrorCode;
import com.inha.netzero.global.response.PageResponse;

@Service
public class MarketService {

    private final MarketItemRepository marketItemRepository;
    private final MarketItemHeartRepository heartRepository;
    private final UserRepository userRepository;

    public MarketService(MarketItemRepository marketItemRepository,
                         MarketItemHeartRepository heartRepository,
                         UserRepository userRepository) {
        this.marketItemRepository = marketItemRepository;
        this.heartRepository = heartRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<MarketItemListResponse> getItems(TradeType tradeType,
                                                         MarketCategory category,
                                                         MarketItemStatus status,
                                                         Pageable pageable) {
        return PageResponse.from(marketItemRepository.search(tradeType, category, status, pageable)
                .map(this::toListResponse));
    }

    @Transactional(readOnly = true)
    public MarketItemDetailResponse getItemDetail(Long itemId, Long currentUserId) {
        MarketItem item = findItemWithImages(itemId);
        validateSellItem(item);

        User user = userRepository.getReferenceById(currentUserId);
        boolean hearted = heartRepository.existsByItemAndUser(item, user);
        return MarketItemDetailResponse.from(item, imageUrls(item), hearted);
    }

    @Transactional
    public Long createItem(MarketItemCreateRequest request, Long currentUserId) {
        Integer price = resolvePrice(request);
        User seller = userRepository.getReferenceById(currentUserId);
        MarketItem item = new MarketItem(
                seller,
                request.tradeType(),
                request.category(),
                request.title(),
                request.content(),
                price);

        if (request.tradeType() == TradeType.SELL && request.imageUrls() != null) {
            for (int i = 0; i < request.imageUrls().size(); i++) {
                item.addImage(new MarketItemImage(request.imageUrls().get(i), i));
            }
        }

        return marketItemRepository.save(item).getId();
    }

    @Transactional
    public HeartToggleResponse toggleHeart(Long itemId, Long currentUserId) {
        MarketItem item = findItemWithImages(itemId);
        validateSellItem(item);

        User user = userRepository.getReferenceById(currentUserId);
        return heartRepository.findByItemAndUser(item, user)
                .map(heart -> removeHeart(item, heart))
                .orElseGet(() -> addHeart(item, user));
    }

    private MarketItemListResponse toListResponse(MarketItem item) {
        if (item.getTradeType() == TradeType.SELL) {
            return MarketItemListResponse.fromSell(item, thumbnailUrl(item));
        }
        return MarketItemListResponse.fromBuy(item);
    }

    private MarketItem findItemWithImages(Long itemId) {
        return marketItemRepository.findWithImagesById(itemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "중고거래 글을 찾을 수 없습니다."));
    }

    private void validateSellItem(MarketItem item) {
        if (item.getTradeType() != TradeType.SELL) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "판매글을 찾을 수 없습니다.");
        }
    }

    private Integer resolvePrice(MarketItemCreateRequest request) {
        if (request.tradeType() == TradeType.SELL) {
            if (request.price() == null) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "판매글은 가격이 필요합니다.");
            }
            return request.price();
        }
        return null;
    }

    private String thumbnailUrl(MarketItem item) {
        return item.getImages().stream()
                .findFirst()
                .map(MarketItemImage::getUrl)
                .orElse(null);
    }

    private List<String> imageUrls(MarketItem item) {
        return item.getImages().stream()
                .map(MarketItemImage::getUrl)
                .toList();
    }

    private HeartToggleResponse addHeart(MarketItem item, User user) {
        heartRepository.save(new MarketItemHeart(item, user));
        item.increaseHeart();
        return new HeartToggleResponse(true, item.getHeartCount());
    }

    private HeartToggleResponse removeHeart(MarketItem item, MarketItemHeart heart) {
        heartRepository.delete(heart);
        item.decreaseHeart();
        return new HeartToggleResponse(false, item.getHeartCount());
    }
}
