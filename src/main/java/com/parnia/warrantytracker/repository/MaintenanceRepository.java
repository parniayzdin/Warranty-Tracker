package com.parnia.warrantytracker.repository;
import com.parnia.warrantytracker.model.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    List<Maintenance> findByAssetId(Long assetId);
    Optional<Maintenance> findByIdAndAssetId(Long id, Long assetId);
    void deleteByAssetId(Long assetId);
}

