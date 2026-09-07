package com.parnia.warrantytracker.service;

import com.parnia.warrantytracker.model.Asset;
import com.parnia.warrantytracker.repository.*;
import com.parnia.warrantytracker.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class AssetService {
    private final AssetRepository assetRepository;
    private final WarrantyRepository warranties;
    private final MaintenanceRepository maintenance;
    private final RecallRepository recalls;
    private final PartRepository parts;

    public AssetService(AssetRepository assetRepository, WarrantyRepository warranties,
                        MaintenanceRepository maintenance, RecallRepository recalls, PartRepository parts) {
        this.assetRepository = assetRepository;
        this.warranties = warranties;
        this.maintenance = maintenance;
        this.recalls = recalls;
        this.parts = parts;
    }
    public Asset saveAsset(Asset asset) { return assetRepository.save(asset); }
    @Transactional(readOnly = true)
    public List<Asset> getAllAssets() { return assetRepository.findAll(); }
    @Transactional(readOnly = true)
    public Asset getAsset(Long id) {
        return assetRepository.findById(id).orElseThrow(() -> new NotFoundException("Asset"));
    }
    public Asset updateAsset(Long id, Asset input) {
        Asset asset = getAsset(id);
        asset.setName(input.getName());
        asset.setCategory(input.getCategory());
        asset.setManufacturer(input.getManufacturer());
        asset.setModelNumber(input.getModelNumber());
        asset.setModelYear(input.getModelYear());
        asset.setSerialNumber(input.getSerialNumber());
        asset.setLocation(input.getLocation());
        asset.setPurchaseDate(input.getPurchaseDate());
        asset.setPurchasePrice(input.getPurchasePrice());
        asset.setNotes(input.getNotes());
        return assetRepository.save(asset);
    }
    public void deleteAsset(Long id) {
        Asset asset = getAsset(id);
        warranties.deleteByAssetId(id);
        maintenance.deleteByAssetId(id);
        recalls.deleteByAssetId(id);
        parts.deleteByAssetId(id);
        assetRepository.delete(asset);
    }
}

