package com.inha.netzero.ai.dto;

public class ProductCatalogItem {

    private final Long id;
    private final String company;
    private final String title;
    private final String category;
    private final int price;
    private final String lowCarbonSummary;

    public ProductCatalogItem(Long id, String company, String title, String category,
                               int price, String lowCarbonSummary) {
        this.id = id;
        this.company = company;
        this.title = title;
        this.category = category;
        this.price = price;
        this.lowCarbonSummary = lowCarbonSummary;
    }

    public Long getId() { return id; }
    public String getCompany() { return company; }
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public int getPrice() { return price; }
    public String getLowCarbonSummary() { return lowCarbonSummary; }
}
