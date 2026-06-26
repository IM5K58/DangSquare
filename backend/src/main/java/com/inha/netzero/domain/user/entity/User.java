package com.inha.netzero.domain.user.entity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.inha.netzero.global.entity.BaseTimeEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/**
 * 사용자. 인증 정보(provider/providerId)와 온보딩 정보(닉네임/성별/강아지 동반 여부),
 * 위치/고스트모드를 가진다. Google OAuth 로그인 사용자는 비밀번호가 없다(passwordHash null).
 * 강아지는 MVP에서 1마리로 운용하되 설계상 1:N(dogs) 으로 확장 가능하다.
 */
@Entity
@Table(name = "users")
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    /** OAuth 로그인 사용자는 비밀번호가 없으므로 nullable. */
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider provider;

    /** 제공자 내부 식별자(Google 의 sub). */
    private String providerId;

    private String nickname;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(nullable = false)
    private boolean hasDog = false;

    @Column(nullable = false)
    private boolean ghostMode = false;

    private Double lat;

    private Double lng;

    private Instant lastActiveAt;

    private String profileImageUrl;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Dog> dogs = new ArrayList<>();

    protected User() {
        // JPA
    }

    /** OAuth(Google) 신규 사용자 생성. 온보딩 전이라 nickname 은 null. */
    public User(String email, AuthProvider provider, String providerId) {
        this.email = email;
        this.provider = provider;
        this.providerId = providerId;
    }

    /** 온보딩이 끝났는지(닉네임 설정 여부). */
    public boolean isOnboarded() {
        return nickname != null;
    }

    /** 온보딩/프로필 갱신. */
    public void updateProfile(String nickname, Gender gender, boolean hasDog) {
        this.nickname = nickname;
        this.gender = gender;
        this.hasDog = hasDog;
    }

    /** 양방향 연관관계를 맞추며 강아지를 추가한다. */
    public void addDog(Dog dog) {
        this.dogs.add(dog);
        dog.assignUser(this);
    }

    public void clearDogs() {
        this.dogs.clear();
    }

    public void updateLocation(double lat, double lng, Instant at) {
        this.lat = lat;
        this.lng = lng;
        this.lastActiveAt = at;
    }

    public void setGhostMode(boolean ghostMode) {
        this.ghostMode = ghostMode;
    }

    public void changeProfileImage(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public AuthProvider getProvider() {
        return provider;
    }

    public String getProviderId() {
        return providerId;
    }

    public String getNickname() {
        return nickname;
    }

    public Gender getGender() {
        return gender;
    }

    public boolean isHasDog() {
        return hasDog;
    }

    public boolean isGhostMode() {
        return ghostMode;
    }

    public Double getLat() {
        return lat;
    }

    public Double getLng() {
        return lng;
    }

    public Instant getLastActiveAt() {
        return lastActiveAt;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public List<Dog> getDogs() {
        return dogs;
    }
}
