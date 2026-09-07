package com.parnia.warrantytracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

@Entity
public class Recall {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "asset_id")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Asset asset;
    @NotBlank @Size(max = 300)
    private String title;
    @NotBlank @Size(max = 80)
    private String source;
    @Size(max = 120)
    private String sourceId;
    @Size(max = 1000) @Pattern(regexp = "https://[^\\s]+", message = "Use a secure web address") @Column(length = 1000)
    private String sourceUrl;
    @Size(max = 10000) @Column(length = 10000)
    private String description;
    
    private LocalDate recallDate;
    @NotBlank @Pattern(regexp = "Open|Resolved")
    private String status = "Open";
    public Long getId() { return id; }
    public Asset getAsset() { return asset; }
    public void setAsset(Asset value) { asset = value; }
    public String getTitle() { return title; }
    public void setTitle(String value) { title = value; }
    public String getSource() { return source; }
    public void setSource(String value) { source = value; }
    public String getSourceId() { return sourceId; }
    public void setSourceId(String value) { sourceId = value; }
    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String value) { sourceUrl = value; }
    public String getDescription() { return description; }
    public void setDescription(String value) { description = value; }
    public LocalDate getRecallDate() { return recallDate; }
    public void setRecallDate(LocalDate value) { recallDate = value; }
    public String getStatus() { return status; }
    public void setStatus(String value) { status = value; }

}


