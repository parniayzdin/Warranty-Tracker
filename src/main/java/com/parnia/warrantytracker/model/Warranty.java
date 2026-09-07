package com.parnia.warrantytracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.*;

import java.time.LocalDate;

@Entity
public class Warranty {

    @Id
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Enter the warranty provider") @Size(max = 120)
    private String provider;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @Size(max = 2000) @Column(length = 2000)
    private String coverage;
    @Min(1) @Max(365)
    private int reminderDays = 30;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String receiptName;
    @JsonIgnore
    private String receiptType;
    @JsonIgnore @Column(columnDefinition = "bytea")
    private byte[] receiptData;

    public String getCoverage() { return coverage; }
    public void setCoverage(String value) { coverage = value; }
    public int getReminderDays() { return reminderDays; }
    public void setReminderDays(int value) { reminderDays = value; }
    public String getReceiptName() { return receiptName; }
    public void setReceiptName(String value) { receiptName = value; }
    public String getReceiptType() { return receiptType; }
    public void setReceiptType(String value) { receiptType = value; }
    public byte[] getReceiptData() { return receiptData; }
    public void setReceiptData(byte[] value) { receiptData = value; }
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public String getStatus() {
        LocalDate today = LocalDate.now();
        if (startDate == null || endDate == null) return "Unknown";
        if (today.isBefore(startDate)) return "Scheduled";
        if (today.isAfter(endDate)) return "Expired";
        return !endDate.isAfter(today.plusDays(reminderDays)) ? "Expiring soon" : "Active";
    }

    //an asset might have multiple warranties, so we map them to one asset
    @ManyToOne
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
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
