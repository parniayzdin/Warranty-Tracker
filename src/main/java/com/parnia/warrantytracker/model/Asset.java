package com.parnia.warrantytracker.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

//This tells JPA that this class should become a database
@Entity
public class Asset {

    //this means postgresSQl will automatically create unique ids
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String category;
    private String manufacturer;
    private String modelNumber;

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