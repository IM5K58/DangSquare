package com.inha.netzero.domain.user.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inha.netzero.domain.user.entity.AuthProvider;
import com.inha.netzero.domain.user.entity.User;
import com.inha.netzero.domain.user.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Google 로그인 시 이메일로 사용자를 찾고 없으면 생성한다.
     * 프로필 이미지는 Google 값으로 최신화한다(닉네임 등 온보딩 정보는 건드리지 않음).
     */
    @Transactional
    public User findOrCreateGoogleUser(String email, String providerId, String profileImageUrl) {
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> new User(email, AuthProvider.GOOGLE, providerId));
        if (profileImageUrl != null) {
            user.changeProfileImage(profileImageUrl);
        }
        return userRepository.save(user);
    }
}
