package com.parnia.warrantytracker.controller;

import com.parnia.warrantytracker.model.Asset;
import com.parnia.warrantytracker.service.AssetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {
    private final AssetService assetService;
    public AssetController(AssetService assetService) { this.assetService = assetService; }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Asset createAsset(@Valid @RequestBody Asset asset) { return assetService.saveAsset(asset); }
    @GetMapping
    public List<Asset> getAllAssets() { return assetService.getAllAssets(); }
    @GetMapping("/{id}")
    public Asset getAsset(@PathVariable Long id) { return assetService.getAsset(id); }
    @PutMapping("/{id}")
    public Asset updateAsset(@PathVariable Long id, @Valid @RequestBody Asset asset) {
        return assetService.updateAsset(id, asset);
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAsset(@PathVariable Long id) { assetService.deleteAsset(id); }
}

