package com.parnia.warrantytracker.repository;
import com.parnia.warrantytracker.model.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface PartRepository extends JpaRepository<Part, Long> {
    List<Part> findByAssetId(Long assetId);
    Optional<Part> findByIdAndAssetId(Long id, Long assetId);
    void deleteByAssetId(Long assetId);
}

