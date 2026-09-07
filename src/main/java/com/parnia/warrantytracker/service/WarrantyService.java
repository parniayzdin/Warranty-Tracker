package com.parnia.warrantytracker.service;

import com.parnia.warrantytracker.model.Asset;
import com.parnia.warrantytracker.model.Warranty;
import com.parnia.warrantytracker.repository.AssetRepository;
import com.parnia.warrantytracker.repository.WarrantyRepository;
import org.springframework.stereotype.Service;

@Service
public class WarrantyService {

    private final WarrantyRepository warrantyRepository;
    private final AssetRepository assetRepository;

    public WarrantyService(
            WarrantyRepository warrantyRepository,
            AssetRepository assetRepository
    ) {
        this.warrantyRepository = warrantyRepository;
        this.assetRepository = assetRepository;
    }

    public Warranty addWarrantyToAsset(Long assetId, Warranty warranty) {

        //look for the asset in PostgreSQL
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));

        //connects that warranty to the asset
        warranty.setAsset(asset);

        return warrantyRepository.save(warranty);
    }
}