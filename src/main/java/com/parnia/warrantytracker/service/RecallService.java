package com.parnia.warrantytracker.service;

import com.parnia.warrantytracker.model.Recall;
import com.parnia.warrantytracker.repository.RecallRepository;
import com.parnia.warrantytracker.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.time.LocalDate;

@Service
@Transactional
public class RecallService {
    private final RecallRepository repository;
    private final AssetService assets;
    public RecallService(RecallRepository repository, AssetService assets) {
        this.repository = repository;
        this.assets = assets;
    }
    @Transactional(readOnly = true)
    public List<Recall> list(Long assetId) { assets.getAsset(assetId); return repository.findByAssetId(assetId); }
    @Transactional(readOnly = true)
    public Recall get(Long assetId, Long id) {
        assets.getAsset(assetId);
        return repository.findByIdAndAssetId(id, assetId).orElseThrow(() -> new NotFoundException("Recall"));
    }
    public Recall create(Long assetId, Recall input) {
        input.setAsset(assets.getAsset(assetId));
        return repository.save(input);
    }
    public Recall update(Long assetId, Long id, Recall input) {
        Recall item = get(assetId, id);
        item.setTitle(input.getTitle());
        item.setSource(input.getSource());
        item.setSourceId(input.getSourceId());
        item.setSourceUrl(input.getSourceUrl());
        item.setDescription(input.getDescription());
        item.setRecallDate(input.getRecallDate());
        item.setStatus(input.getStatus());

        return repository.save(item);
    }
    public void delete(Long assetId, Long id) { repository.delete(get(assetId, id)); }

}

