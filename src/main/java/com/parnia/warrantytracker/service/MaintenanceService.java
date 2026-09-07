package com.parnia.warrantytracker.service;

import com.parnia.warrantytracker.model.Maintenance;
import com.parnia.warrantytracker.repository.MaintenanceRepository;
import com.parnia.warrantytracker.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.time.LocalDate;

@Service
@Transactional
public class MaintenanceService {
    private final MaintenanceRepository repository;
    private final AssetService assets;
    public MaintenanceService(MaintenanceRepository repository, AssetService assets) {
        this.repository = repository;
        this.assets = assets;
    }
    @Transactional(readOnly = true)
    public List<Maintenance> list(Long assetId) { assets.getAsset(assetId); return repository.findByAssetId(assetId); }
    @Transactional(readOnly = true)
    public Maintenance get(Long assetId, Long id) {
        assets.getAsset(assetId);
        return repository.findByIdAndAssetId(id, assetId).orElseThrow(() -> new NotFoundException("Maintenance"));
    }
    public Maintenance create(Long assetId, Maintenance input) {
        input.setAsset(assets.getAsset(assetId));
        return repository.save(input);
    }
    public Maintenance update(Long assetId, Long id, Maintenance input) {
        Maintenance item = get(assetId, id);
        item.setTitle(input.getTitle());
        item.setNextDueDate(input.getNextDueDate());
        item.setIntervalDays(input.getIntervalDays());
        item.setNotes(input.getNotes());
        item.setCompleted(false);
        return repository.save(item);
    }
    public void delete(Long assetId, Long id) { repository.delete(get(assetId, id)); }
    public Maintenance complete(Long assetId, Long id) {
        Maintenance item = get(assetId, id);
        LocalDate today = LocalDate.now();
        if (item.isCompleted() || today.equals(item.getLastCompletedDate()))
            throw new IllegalArgumentException("This task has already been completed today");
        item.setLastCompletedDate(today);
        if (item.getIntervalDays() == null) item.setCompleted(true);
        else item.setNextDueDate(today.plusDays(item.getIntervalDays()));
        return repository.save(item);
    }
}

