package com.parnia.warrantytracker.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.math.BigDecimal;

//This tells JPA that this class should become a database
@Entity
public class Asset {

    //this means postgresSQl will automatically create unique ids
    @Id
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Give your item a name") @Size(max = 120)
    private String name;
    @NotBlank @Pattern(regexp = "Appliances|Electronics|Vehicles|Baby products|Home equipment|Other", message = "Choose a supported category")
    private String category;
    @NotBlank(message = "Enter the manufacturer") @Size(max = 120)
    private String manufacturer;
    @NotBlank(message = "Enter the model") @Size(max = 120)
    private String modelNumber;
    @Size(max = 120)
    private String serialNumber;
    @Size(max = 120)
    private String location;
    @Size(max = 2000)
    @jakarta.persistence.Column(length = 2000)
    private String notes;
    @PastOrPresent(message = "Purchase date cannot be in the future")
    private LocalDate purchaseDate;
    @DecimalMin("0.00") @Digits(integer = 10, fraction = 2)
    private BigDecimal purchasePrice;
    @Min(1900) @Max(2100)
    private Integer modelYear;

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String value) { serialNumber = value; }
    public String getLocation() { return location; }
    public void setLocation(String value) { location = value; }
    public String getNotes() { return notes; }
    public void setNotes(String value) { notes = value; }
    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate value) { purchaseDate = value; }
    public BigDecimal getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(BigDecimal value) { purchasePrice = value; }
    public Integer getModelYear() { return modelYear; }
    public void setModelYear(Integer value) { modelYear = value; }

    public Asset() {
    }

    public Asset(String name, String category, String manufacturer, String modelNumber) {
        this.name = name;
        this.category = category;
        this.manufacturer = manufacturer;
        this.modelNumber = modelNumber;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public String getModelNumber() {
        return modelNumber;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public void setModelNumber(String modelNumber) {
        this.modelNumber = modelNumber;
    }
}
