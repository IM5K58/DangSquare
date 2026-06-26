package com.inha.netzero.ai.dto;

public class DogProfile {

    private final String name;
    private final String breed;
    private final Integer age;
    private final String temperament;

    public DogProfile(String name, String breed, Integer age, String temperament) {
        this.name = name;
        this.breed = breed;
        this.age = age;
        this.temperament = temperament;
    }

    public String getName() { return name; }
    public String getBreed() { return breed; }
    public Integer getAge() { return age; }
    public String getTemperament() { return temperament; }
}
