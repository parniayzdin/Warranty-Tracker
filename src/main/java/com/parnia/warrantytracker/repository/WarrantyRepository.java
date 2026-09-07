package com.parnia.warrantytracker.repository;

import com.parnia.warrantytracker.model.Warranty;
import org.springframework.data.jpa.repository.JpaRepository;

//manage asset objects and the ID of the asset is long
public interface WarrantyRepository extends JpaRepository<Warranty, Long> {
    java.util.List<Warranty> findByAssetId(Long assetId);
    java.util.Optional<Warranty> findByIdAndAssetId(Long id, Long assetId);
    void deleteByAssetId(Long assetId);
}
