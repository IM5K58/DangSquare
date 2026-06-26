package com.inha.netzero;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.inha.netzero.ai.dto.DogProfile;
import com.inha.netzero.ai.dto.ProductCatalogItem;
import com.inha.netzero.ai.dto.RecommendationResult;
import com.inha.netzero.ai.dto.SellDraftResult;
import com.inha.netzero.ai.service.LlmService;
import com.inha.netzero.domain.user.entity.AuthProvider;
import com.inha.netzero.domain.user.entity.User;
import com.inha.netzero.domain.user.repository.UserRepository;
import com.inha.netzero.global.security.JwtTokenProvider;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class Phase6IntegrationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void healthReturnsApiResponse() throws Exception {
        MvcResult response = mockMvc.perform(get("/api/health")).andReturn();
        JsonNode body = readBody(response);

        assertEquals(HttpStatus.OK.value(), response.getResponse().getStatus());
        assertEquals("success", body.path("status").asText());
        assertEquals("UP", body.path("data").path("status").asText());
    }

    @Test
    void protectedApiWithoutTokenRedirectsToOAuthLogin() throws Exception {
        MvcResult response = mockMvc.perform(get("/api/marketplace/products")).andReturn();

        assertEquals(HttpStatus.FOUND.value(), response.getResponse().getStatus());
        assertTrue(response.getResponse().getHeader(HttpHeaders.LOCATION).contains("/oauth2/authorization/google"));
    }

    @Test
    void marketplaceProductsExposeSeedDataAndLowCarbonSummary() throws Exception {
        MvcResult response = mockMvc.perform(get("/api/marketplace/products?category=FOOD")
                        .headers(authHeaders(saveUser("marketplace"))))
                .andReturn();
        JsonNode content = readBody(response).path("data").path("content");

        assertEquals(HttpStatus.OK.value(), response.getResponse().getStatus());
        assertFalse(content.isEmpty());
        assertTrue(content.get(0).hasNonNull("lowCarbonSummary"));
    }

    @Test
    void marketSellItemCanBeCreatedReadAndHeartToggled() throws Exception {
        User user = saveUser("seller");
        Long itemId = createItem(user, sellPayload());

        MvcResult detail = mockMvc.perform(get("/api/market/items/" + itemId)
                        .headers(authHeaders(user)))
                .andReturn();
        MvcResult firstHeart = mockMvc.perform(post("/api/market/items/" + itemId + "/heart")
                        .headers(authHeaders(user)))
                .andReturn();
        MvcResult secondHeart = mockMvc.perform(post("/api/market/items/" + itemId + "/heart")
                        .headers(authHeaders(user)))
                .andReturn();

        JsonNode detailData = readBody(detail).path("data");
        JsonNode firstHeartData = readBody(firstHeart).path("data");
        JsonNode secondHeartData = readBody(secondHeart).path("data");

        assertEquals(HttpStatus.OK.value(), detail.getResponse().getStatus());
        assertEquals("SELL", detailData.path("tradeType").asText());
        assertEquals("https://example.com/dog-bed-1.jpg", detailData.path("images").get(0).asText());
        assertTrue(firstHeartData.path("hearted").asBoolean());
        assertFalse(secondHeartData.path("hearted").asBoolean());
    }

    @Test
    void marketBuyItemAppearsInListButDetailReturnsNotFound() throws Exception {
        User user = saveUser("buyer");
        Long itemId = createItem(user, buyPayload());

        MvcResult list = mockMvc.perform(get("/api/market/items?tradeType=BUY&category=TOY")
                        .headers(authHeaders(user)))
                .andReturn();
        MvcResult detail = mockMvc.perform(get("/api/market/items/" + itemId)
                        .headers(authHeaders(user)))
                .andReturn();

        JsonNode firstItem = readBody(list).path("data").path("content").get(0);
        JsonNode detailBody = readBody(detail);

        assertEquals(HttpStatus.OK.value(), list.getResponse().getStatus());
        assertEquals("BUY", firstItem.path("tradeType").asText());
        assertTrue(firstItem.hasNonNull("author"));
        assertEquals(HttpStatus.NOT_FOUND.value(), detail.getResponse().getStatus());
        assertEquals("NOT_FOUND", detailBody.path("code").asText());
    }

    @Test
    void invalidMarketCreateReturnsValidationError() throws Exception {
        User user = saveUser("invalid");
        Map<String, Object> payload = sellPayload();
        payload.put("title", "");

        MvcResult response = mockMvc.perform(post("/api/market/items")
                        .headers(jsonHeaders(user))
                        .content(objectMapper.writeValueAsString(payload)))
                .andReturn();
        JsonNode body = readBody(response);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getResponse().getStatus());
        assertEquals("VALIDATION_ERROR", body.path("code").asText());
    }

    @Test
    void marketplaceRecommendationUsesLocalLlmFallback() throws Exception {
        User user = saveUser("recommendation");
        MvcResult response = mockMvc.perform(post("/api/marketplace/recommendations")
                        .headers(jsonHeaders(user))
                        .content(objectMapper.writeValueAsString(Map.of("query", "알러지가 적은 사료"))))
                .andReturn();
        JsonNode recommendations = readBody(response).path("data").path("recommendations");

        assertEquals(HttpStatus.OK.value(), response.getResponse().getStatus());
        assertFalse(recommendations.isEmpty());
        assertTrue(recommendations.get(0).path("productId").asLong() > 0);
    }

    @Test
    void sellDraftEndpointReturnsFallbackDraft() throws Exception {
        User user = saveUser("draft");
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "item.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                new byte[] {1, 2, 3});

        MvcResult response = mockMvc.perform(multipart("/api/market/items/draft")
                        .file(image)
                        .param("keywords", "방석,소형견")
                        .headers(authHeaders(user)))
                .andReturn();
        JsonNode data = readBody(response).path("data");

        assertEquals(HttpStatus.OK.value(), response.getResponse().getStatus());
        assertEquals("ETC", data.path("suggestedCategory").asText());
    }

    private Long createItem(User user, Map<String, Object> payload) throws Exception {
        MvcResult response = mockMvc.perform(post("/api/market/items")
                        .headers(jsonHeaders(user))
                        .content(objectMapper.writeValueAsString(payload)))
                .andReturn();

        assertEquals(HttpStatus.CREATED.value(), response.getResponse().getStatus());
        return readBody(response).path("data").path("itemId").asLong();
    }

    private User saveUser(String suffix) {
        User user = new User("phase6-" + suffix + "-" + System.nanoTime() + "@example.com",
                AuthProvider.GOOGLE,
                "phase6-" + suffix);
        user.updateProfile("phase6-" + suffix, null, false);
        return userRepository.save(user);
    }

    private HttpHeaders authHeaders(User user) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(jwtTokenProvider.generateToken(user.getId()));
        return headers;
    }

    private HttpHeaders jsonHeaders(User user) {
        HttpHeaders headers = authHeaders(user);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private JsonNode readBody(MvcResult response) throws Exception {
        String body = response.getResponse().getContentAsString();
        assertNotNull(body);
        return objectMapper.readTree(body);
    }

    private Map<String, Object> sellPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("tradeType", "SELL");
        payload.put("category", "DAILY");
        payload.put("title", "강아지 방석 팝니다");
        payload.put("content", "거의 새것입니다");
        payload.put("price", 15000);
        payload.put("imageUrls", List.of("https://example.com/dog-bed-1.jpg", "https://example.com/dog-bed-2.jpg"));
        return payload;
    }

    private Map<String, Object> buyPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("tradeType", "BUY");
        payload.put("category", "TOY");
        payload.put("title", "노즈워크 매트 구해요");
        payload.put("content", "중고도 괜찮아요");
        return payload;
    }

    @TestConfiguration
    static class LocalLlmTestConfig {

        @Bean
        @Primary
        LlmService llmService() {
            return new LlmService(null) {
                @Override
                public SellDraftResult generateSellDraft(byte[] imageBytes, String imageFormat, List<String> keywords) {
                    return SellDraftResult.empty();
                }

                @Override
                public RecommendationResult recommendProducts(String query,
                                                              DogProfile dogProfile,
                                                              List<ProductCatalogItem> catalog) {
                    if (catalog.isEmpty()) {
                        return RecommendationResult.empty();
                    }
                    ProductCatalogItem first = catalog.get(0);
                    return new RecommendationResult(List.of(
                            new RecommendationResult.Item(first.getId(), "로컬 통합 검증용 추천입니다.")));
                }
            };
        }
    }
}
