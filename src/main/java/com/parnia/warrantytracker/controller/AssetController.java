package com.parnia.warrantytracker.controller;

import com.parnia.warrantytracker.model.Asset;
import com.parnia.warrantytracker.service.AssetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    //so save an asset
    @PostMapping
    public Asset createAsset(@RequestBody Asset asset) {
        return assetService.saveAsset(asset);
    }

    //to get an asset
    //Ask Spring Boot backend for all saved assets.
    @GetMapping
    public List<Asset> getAllAssets() {
        return assetService.getAllAssets();
    }
}