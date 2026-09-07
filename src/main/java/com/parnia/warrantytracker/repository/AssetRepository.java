package com.parnia.warrantytracker.repository;

import com.parnia.warrantytracker.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

//manage asset objects and the ID of the asset is long
public interface AssetRepository extends JpaRepository<Asset, Long> {
}