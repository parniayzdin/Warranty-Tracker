package com.parnia.warrantytracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

@Entity
public class Maintenance {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "asset_id")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Asset asset;
    @NotBlank(message = "Enter a task name") @Size(max = 120)
    private String title;
    @NotNull
    private LocalDate nextDueDate;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDate lastCompletedDate;
    @Min(1) @Max(3650)
    private Integer intervalDays;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private boolean completed;
    @Size(max = 2000) @Column(length = 2000)
    private String notes;
    public Long getId() { return id; }
    public Asset getAsset() { return asset; }
    public void setAsset(Asset value) { asset = value; }
    public String getTitle() { return title; }
    public void setTitle(String value) { title = value; }
    public LocalDate getNextDueDate() { return nextDueDate; }
    public void setNextDueDate(LocalDate value) { nextDueDate = value; }
    public LocalDate getLastCompletedDate() { return lastCompletedDate; }
    public void setLastCompletedDate(LocalDate value) { lastCompletedDate = value; }
    public Integer getIntervalDays() { return intervalDays; }
    public void setIntervalDays(Integer value) { intervalDays = value; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean value) { completed = value; }
    public String getNotes() { return notes; }
    public void setNotes(String value) { notes = value; }
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public String getStatus() {
        if (completed) return "Completed";
        if (nextDueDate == null) return "Scheduled";
        if (nextDueDate.isBefore(LocalDate.now())) return "Overdue";
        return !nextDueDate.isAfter(LocalDate.now().plusDays(7)) ? "Due soon" : "Scheduled";
    }
}

