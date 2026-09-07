package com.parnia.warrantytracker.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class Warranty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String provider;

    private LocalDate startDate;

    private LocalDate endDate;

    //an asset might have multiple warranties, so we map them to one asset
    @ManyToOne
    @JoinColumn(name = "asset_id")
    private Asset asset;

    public Warranty() {
    }

    public Warranty(
            String provider,
            LocalDate startDate,
            LocalDate endDate,
            Asset asset
    ) {
        this.provider = provider;
        this.startDate = startDate;
        this.endDate = endDate;
        this.asset = asset;
    }

    public Long getId() {
        return id;
    }

    public String getProvider() {
        return provider;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public Asset getAsset() {
        return asset;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public void setAsset(Asset asset) {
        this.asset = asset;
    }
}