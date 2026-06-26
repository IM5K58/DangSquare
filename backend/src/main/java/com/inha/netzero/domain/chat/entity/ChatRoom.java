package com.inha.netzero.domain.chat.entity;

import java.time.Instant;

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
 * 1:1 대화방. (userA, userB) 쌍은 유일하다. 서비스에서 userA.id < userB.id 로 정규화해
 * 같은 두 사용자의 방이 중복 생성되지 않게 한다(idempotent).
 */
@Entity
@Table(name = "chat_room",
        uniqueConstraints = @UniqueConstraint(name = "uk_chat_room_pair",
                columnNames = {"user_a_id", "user_b_id"}))
public class ChatRoom extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_a_id")
    private User userA;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_b_id")
    private User userB;

    private Instant lastMessageAt;

    protected ChatRoom() {
        // JPA
    }

    public ChatRoom(User userA, User userB) {
        this.userA = userA;
        this.userB = userB;
    }

    /** 메시지 송신 시 방 목록 정렬 기준을 갱신한다. */
    public void touch(Instant at) {
        this.lastMessageAt = at;
    }

    public Long getId() {
        return id;
    }

    public User getUserA() {
        return userA;
    }

    public User getUserB() {
        return userB;
    }

    public Instant getLastMessageAt() {
        return lastMessageAt;
    }
}
