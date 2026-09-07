package com.parnia.warrantytracker.controller;

import com.parnia.warrantytracker.model.Recall;
import com.parnia.warrantytracker.service.RecallService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/assets/{assetId}/recalls")
public class RecallController {
    private final RecallService service;
    public RecallController(RecallService service) { this.service = service; }
    @GetMapping
    public List<Recall> list(@PathVariable Long assetId) { return service.list(assetId); }
    @GetMapping("/{id}")
    public Recall get(@PathVariable Long assetId, @PathVariable Long id) { return service.get(assetId, id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Recall create(@PathVariable Long assetId, @Valid @RequestBody Recall input) { return service.create(assetId, input); }
    @PutMapping("/{id}")
    public Recall update(@PathVariable Long assetId, @PathVariable Long id, @Valid @RequestBody Recall input) { return service.update(assetId, id, input); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long assetId, @PathVariable Long id) { service.delete(assetId, id); }

}

