package com.inha.netzero.domain.market.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.inha.netzero.domain.user.entity.User;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AuthorResponse(
        Long userId,
        String nickname,
        String profileImageUrl
) {

    public static AuthorResponse from(User user) {
        return new AuthorResponse(user.getId(), user.getNickname(), user.getProfileImageUrl());
    }
}
