package com.parnia.warrantytracker.controller;

import com.parnia.warrantytracker.model.Part;
import com.parnia.warrantytracker.service.PartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/assets/{assetId}/parts")
public class PartController {
    private final PartService service;
    public PartController(PartService service) { this.service = service; }
    @GetMapping
    public List<Part> list(@PathVariable Long assetId) { return service.list(assetId); }
    @GetMapping("/{id}")
    public Part get(@PathVariable Long assetId, @PathVariable Long id) { return service.get(assetId, id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Part create(@PathVariable Long assetId, @Valid @RequestBody Part input) { return service.create(assetId, input); }
    @PutMapping("/{id}")
    public Part update(@PathVariable Long assetId, @PathVariable Long id, @Valid @RequestBody Part input) { return service.update(assetId, id, input); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long assetId, @PathVariable Long id) { service.delete(assetId, id); }

}

