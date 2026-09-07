package com.parnia.warrantytracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

@Entity
public class Part {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "asset_id")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Asset asset;
    @NotBlank @Size(max = 120)
    private String name;
    @Size(max = 120)
    private String partNumber;
    @Size(max = 120)
    private String supplier;
    @Size(max = 1000) @Pattern(regexp = "https://[^\\s]+", message = "Use a secure web address") @Column(length = 1000)
    private String url;
    @Size(max = 2000) @Column(length = 2000)
    private String notes;
    public Long getId() { return id; }
    public Asset getAsset() { return asset; }
    public void setAsset(Asset value) { asset = value; }
    public String getName() { return name; }
    public void setName(String value) { name = value; }
    public String getPartNumber() { return partNumber; }
    public void setPartNumber(String value) { partNumber = value; }
    public String getSupplier() { return supplier; }
    public void setSupplier(String value) { supplier = value; }
    public String getUrl() { return url; }
    public void setUrl(String value) { url = value; }
    public String getNotes() { return notes; }
    public void setNotes(String value) { notes = value; }

}


