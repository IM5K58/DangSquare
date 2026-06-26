package com.inha.netzero.ai.client;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.ContentBlock;
import software.amazon.awssdk.services.bedrockruntime.model.ConversationRole;
import software.amazon.awssdk.services.bedrockruntime.model.ConverseRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InferenceConfiguration;
import software.amazon.awssdk.services.bedrockruntime.model.ImageBlock;
import software.amazon.awssdk.services.bedrockruntime.model.ImageFormat;
import software.amazon.awssdk.services.bedrockruntime.model.ImageSource;
import software.amazon.awssdk.services.bedrockruntime.model.Message;
import software.amazon.awssdk.services.bedrockruntime.model.SystemContentBlock;

/**
 * AWS Bedrock Converse API 래퍼.
 * DefaultCredentialsProvider(IAM Role) 사용 — Access Key 절대 금지.
 * 로컬 환경(자격증명 없음)에서는 클라이언트 생성은 성공하고 실제 호출 시 예외 발생 → LlmService가 폴백 처리.
 */
@Component
public class BedrockClient {

    private static final Logger log = LoggerFactory.getLogger(BedrockClient.class);

    private final String modelId;
    private final BedrockRuntimeClient client;
    private final int maxTokens;
    private final float temperature;

    public BedrockClient(
            BedrockRuntimeClient client,
            @Value("${app.bedrock.model-id}") String modelId,
            @Value("${app.bedrock.max-tokens}") int maxTokens,
            @Value("${app.bedrock.temperature}") float temperature) {
        this.client = client;
        this.modelId = modelId;
        this.maxTokens = maxTokens;
        this.temperature = temperature;
    }

    /**
     * 텍스트 전용 Converse 호출.
     * @return 모델 텍스트 응답, 실패 시 null
     */
    public String converseText(String systemPrompt, String userPrompt) {
        try {
            var request = ConverseRequest.builder()
                    .modelId(modelId)
                    .system(SystemContentBlock.fromText(systemPrompt))
                    .messages(Message.builder()
                            .role(ConversationRole.USER)
                            .content(ContentBlock.fromText(userPrompt))
                            .build())
                    .inferenceConfig(inferenceConfiguration())
                    .build();
            return extractText(client.converse(request));
        } catch (Exception e) {
            log.warn("Bedrock converseText failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 이미지 + 텍스트 멀티모달 Converse 호출.
     * @return 모델 텍스트 응답, 실패 시 null
     */
    public String converseWithImage(String systemPrompt, String userPrompt,
                                    byte[] imageBytes, String imageFormat) {
        try {
            var imageContent = ContentBlock.fromImage(
                    ImageBlock.builder()
                            .format(ImageFormat.fromValue(imageFormat))
                            .source(ImageSource.fromBytes(SdkBytes.fromByteArray(imageBytes)))
                            .build());
            var request = ConverseRequest.builder()
                    .modelId(modelId)
                    .system(SystemContentBlock.fromText(systemPrompt))
                    .messages(Message.builder()
                            .role(ConversationRole.USER)
                            .content(imageContent, ContentBlock.fromText(userPrompt))
                            .build())
                    .inferenceConfig(inferenceConfiguration())
                    .build();
            return extractText(client.converse(request));
        } catch (Exception e) {
            log.warn("Bedrock converseWithImage failed: {}", e.getMessage());
            return null;
        }
    }

    private String extractText(software.amazon.awssdk.services.bedrockruntime.model.ConverseResponse response) {
        return response.output().message().content().stream()
                .filter(c -> c.text() != null)
                .map(ContentBlock::text)
                .findFirst()
                .orElse(null);
    }

    private InferenceConfiguration inferenceConfiguration() {
        return InferenceConfiguration.builder()
                .maxTokens(maxTokens)
                .temperature(temperature)
                .build();
    }
}
