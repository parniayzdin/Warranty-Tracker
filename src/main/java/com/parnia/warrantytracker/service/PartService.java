package com.parnia.warrantytracker.service;

import com.parnia.warrantytracker.model.Part;
import com.parnia.warrantytracker.repository.PartRepository;
import com.parnia.warrantytracker.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.time.LocalDate;

@Service
@Transactional
public class PartService {
    private final PartRepository repository;
    private final AssetService assets;
    public PartService(PartRepository repository, AssetService assets) {
        this.repository = repository;
        this.assets = assets;
    }
    @Transactional(readOnly = true)
    public List<Part> list(Long assetId) { assets.getAsset(assetId); return repository.findByAssetId(assetId); }
    @Transactional(readOnly = true)
    public Part get(Long assetId, Long id) {
        assets.getAsset(assetId);
        return repository.findByIdAndAssetId(id, assetId).orElseThrow(() -> new NotFoundException("Part"));
    }
    public Part create(Long assetId, Part input) {
        input.setAsset(assets.getAsset(assetId));
        return repository.save(input);
    }
    public Part update(Long assetId, Long id, Part input) {
        Part item = get(assetId, id);
        item.setName(input.getName());
        item.setPartNumber(input.getPartNumber());
        item.setSupplier(input.getSupplier());
        item.setUrl(input.getUrl());
        item.setNotes(input.getNotes());

        return repository.save(item);
    }
    public void delete(Long assetId, Long id) { repository.delete(get(assetId, id)); }

}

