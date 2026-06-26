package com.inha.netzero.domain.walk.entity;

/**
 * 친구 요청 상태. ACCEPTED 인 행이 곧 친구 관계를 표현한다.
 */
public enum FriendRequestStatus {
    PENDING,
    ACCEPTED,
    REJECTED
}
