package com.inha.netzero.domain.marketplace.service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inha.netzero.ai.dto.DogProfile;
import com.inha.netzero.ai.dto.ProductCatalogItem;
import com.inha.netzero.ai.dto.RecommendationResult;
import com.inha.netzero.ai.service.LlmService;
import com.inha.netzero.domain.marketplace.dto.MarketplaceProductListResponse;
import com.inha.netzero.domain.marketplace.dto.RecommendationResponse;
import com.inha.netzero.domain.marketplace.entity.MarketplaceCategory;
import com.inha.netzero.domain.marketplace.entity.MarketplaceProduct;
import com.inha.netzero.domain.marketplace.repository.MarketplaceProductRepository;
import com.inha.netzero.domain.user.entity.Dog;
import com.inha.netzero.domain.user.entity.User;
import com.inha.netzero.domain.user.repository.UserRepository;
import com.inha.netzero.global.response.PageResponse;

@Service
@Transactional(readOnly = true)
public class MarketplaceService {

    private final MarketplaceProductRepository productRepository;
    private final UserRepository userRepository;
    private final LlmService llmService;

    public MarketplaceService(MarketplaceProductRepository productRepository,
                               UserRepository userRepository,
                               LlmService llmService) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.llmService = llmService;
    }

    public PageResponse<MarketplaceProductListResponse> getProducts(MarketplaceCategory category, Pageable pageable) {
        var page = (category == null)
                ? productRepository.findAll(pageable)
                : productRepository.findByCategory(category, pageable);
        return PageResponse.of(page.map(MarketplaceProductListResponse::from));
    }

    public RecommendationResponse getRecommendations(String query, Long currentUserId) {
        // 강아지 프로필 조회
        DogProfile dogProfile = userRepository.findById(currentUserId)
                .map(User::getDogs)
                .filter(dogs -> !dogs.isEmpty())
                .map(dogs -> toDogProfile(dogs.get(0)))
                .orElse(null);

        // 전체 카탈로그
        List<MarketplaceProduct> all = productRepository.findAll();
        List<ProductCatalogItem> catalog = all.stream()
                .map(this::toCatalogItem)
                .toList();

        if (catalog.isEmpty()) {
            return new RecommendationResponse(List.of());
        }

        // LLM 호출 + 환각 id 필터링 + title 조인
        RecommendationResult result = llmService.recommendProducts(query, dogProfile, catalog);
        Set<Long> validIds = all.stream().map(MarketplaceProduct::getId).collect(Collectors.toSet());
        Map<Long, String> idToTitle = all.stream()
                .collect(Collectors.toMap(MarketplaceProduct::getId, MarketplaceProduct::getTitle));

        List<RecommendationResponse.RecommendationItem> items = result.getRecommendations().stream()
                .filter(r -> validIds.contains(r.getProductId()))
                .map(r -> new RecommendationResponse.RecommendationItem(
                        r.getProductId(),
                        idToTitle.getOrDefault(r.getProductId(), ""),
                        r.getReason()))
                .toList();

        return new RecommendationResponse(items);
    }

    private DogProfile toDogProfile(Dog dog) {
        return new DogProfile(
                dog.getName(),
                dog.getBreed(),
                dog.getAge(),
                dog.getTemperament() != null ? dog.getTemperament().name() : null);
    }

    private ProductCatalogItem toCatalogItem(MarketplaceProduct p) {
        return new ProductCatalogItem(
                p.getId(), p.getCompany(), p.getTitle(),
                p.getCategory().name(), p.getPrice(), p.getLowCarbonSummary());
    }
}
