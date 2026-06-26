package com.inha.netzero.domain.market.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.inha.netzero.domain.market.dto.HeartToggleResponse;
import com.inha.netzero.domain.market.dto.MarketItemCreateRequest;
import com.inha.netzero.domain.market.dto.MarketItemDetailResponse;
import com.inha.netzero.domain.market.entity.MarketCategory;
import com.inha.netzero.domain.market.entity.TradeType;
import com.inha.netzero.domain.user.entity.AuthProvider;
import com.inha.netzero.domain.user.entity.User;
import com.inha.netzero.domain.user.repository.UserRepository;
import com.inha.netzero.global.exception.BusinessException;
import com.inha.netzero.global.exception.ErrorCode;

@SpringBootTest
@Transactional
class MarketServiceTest {

    @Autowired
    private MarketService marketService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void createSellItemAndReadDetail() {
        User user = saveUser("seller@example.com", "판매자");
        Long itemId = marketService.createItem(sellRequest(), user.getId());

        MarketItemDetailResponse detail = marketService.getItemDetail(itemId, user.getId());

        assertEquals(List.of("https://example.com/1.jpg", "https://example.com/2.jpg"), detail.images());
    }

    @Test
    void buyItemDetailThrowsNotFound() {
        User user = saveUser("buyer@example.com", "구매자");
        Long itemId = marketService.createItem(buyRequest(), user.getId());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> marketService.getItemDetail(itemId, user.getId()));

        assertEquals(ErrorCode.NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void toggleHeartAddsAndRemovesHeart() {
        User user = saveUser("heart@example.com", "하트");
        Long itemId = marketService.createItem(sellRequest(), user.getId());

        marketService.toggleHeart(itemId, user.getId());
        HeartToggleResponse response = marketService.toggleHeart(itemId, user.getId());

        assertEquals(0, response.heartCount());
    }

    private User saveUser(String email, String nickname) {
        User user = new User(email, AuthProvider.GOOGLE, email);
        user.updateProfile(nickname, null, false);
        return userRepository.save(user);
    }

    private MarketItemCreateRequest sellRequest() {
        return new MarketItemCreateRequest(
                TradeType.SELL,
                MarketCategory.DAILY,
                "강아지 방석 팝니다",
                "거의 새것입니다",
                15000,
                List.of("https://example.com/1.jpg", "https://example.com/2.jpg"));
    }

    private MarketItemCreateRequest buyRequest() {
        return new MarketItemCreateRequest(
                TradeType.BUY,
                MarketCategory.TOY,
                "노즈워크 매트 구해요",
                "중고도 괜찮아요",
                null,
                null);
    }
}
