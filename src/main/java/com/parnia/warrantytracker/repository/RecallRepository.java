package com.parnia.warrantytracker.repository;
import com.parnia.warrantytracker.model.Recall;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface RecallRepository extends JpaRepository<Recall, Long> {
    List<Recall> findByAssetId(Long assetId);
    Optional<Recall> findByIdAndAssetId(Long id, Long assetId);
    void deleteByAssetId(Long assetId);
}

