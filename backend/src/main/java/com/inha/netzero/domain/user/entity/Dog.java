package com.inha.netzero.domain.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * 강아지. 소유자(User)에 종속된다. hasDog == true 인 사용자만 가진다.
 */
@Entity
@Table(name = "dogs")
public class Dog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String breed;

    private Integer age;

    @Enumerated(EnumType.STRING)
    private DogTemperament temperament;

    private String imageUrl;

    protected Dog() {
        // JPA
    }

    public Dog(String name, Gender gender, String breed, Integer age, DogTemperament temperament, String imageUrl) {
        this.name = name;
        this.gender = gender;
        this.breed = breed;
        this.age = age;
        this.temperament = temperament;
        this.imageUrl = imageUrl;
    }

    /** User.addDog 에서 양방향 연관관계를 맞추기 위해 호출한다. */
    void assignUser(User user) {
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getName() {
        return name;
    }

    public Gender getGender() {
        return gender;
    }

    public String getBreed() {
        return breed;
    }

    public Integer getAge() {
        return age;
    }

    public DogTemperament getTemperament() {
        return temperament;
    }

    public String getImageUrl() {
        return imageUrl;
    }
}
