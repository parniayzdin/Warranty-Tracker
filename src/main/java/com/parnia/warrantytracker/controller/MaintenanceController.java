package com.parnia.warrantytracker.controller;

import com.parnia.warrantytracker.model.Maintenance;
import com.parnia.warrantytracker.service.MaintenanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/assets/{assetId}/maintenance")
public class MaintenanceController {
    private final MaintenanceService service;
    public MaintenanceController(MaintenanceService service) { this.service = service; }
    @GetMapping
    public List<Maintenance> list(@PathVariable Long assetId) { return service.list(assetId); }
    @GetMapping("/{id}")
    public Maintenance get(@PathVariable Long assetId, @PathVariable Long id) { return service.get(assetId, id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Maintenance create(@PathVariable Long assetId, @Valid @RequestBody Maintenance input) { return service.create(assetId, input); }
    @PutMapping("/{id}")
    public Maintenance update(@PathVariable Long assetId, @PathVariable Long id, @Valid @RequestBody Maintenance input) { return service.update(assetId, id, input); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long assetId, @PathVariable Long id) { service.delete(assetId, id); }
    @PostMapping("/{id}/complete")
    public Maintenance complete(@PathVariable Long assetId, @PathVariable Long id) { return service.complete(assetId, id); }
}

