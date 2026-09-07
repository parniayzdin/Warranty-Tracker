package com.parnia.warrantytracker.service;

import com.parnia.warrantytracker.model.*;
import com.parnia.warrantytracker.repository.*;
import com.parnia.warrantytracker.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;
import java.io.IOException;

@Service
@Transactional
public class WarrantyService {
    private final WarrantyRepository warrantyRepository;
    private final AssetRepository assetRepository;
    public WarrantyService(WarrantyRepository warrantyRepository, AssetRepository assetRepository) {
        this.warrantyRepository = warrantyRepository;
        this.assetRepository = assetRepository;
    }
    private Asset asset(Long id) {
        return assetRepository.findById(id).orElseThrow(() -> new NotFoundException("Asset"));
    }
    private void validate(Warranty warranty) {
        if (warranty.getEndDate().isBefore(warranty.getStartDate()))
            throw new IllegalArgumentException("Warranty end date must be on or after its start date");
    }
    public Warranty addWarrantyToAsset(Long assetId, Warranty warranty) {
        warranty.setAsset(asset(assetId));
        validate(warranty);
        return warrantyRepository.save(warranty);
    }
    @Transactional(readOnly = true)
    public List<Warranty> list(Long assetId) { asset(assetId); return warrantyRepository.findByAssetId(assetId); }
    @Transactional(readOnly = true)
    public Warranty get(Long assetId, Long id) {
        asset(assetId);
        return warrantyRepository.findByIdAndAssetId(id, assetId).orElseThrow(() -> new NotFoundException("Warranty"));
    }
    public Warranty update(Long assetId, Long id, Warranty input) {
        Warranty item = get(assetId, id);
        validate(input);
        item.setProvider(input.getProvider());
        item.setStartDate(input.getStartDate());
        item.setEndDate(input.getEndDate());
        item.setCoverage(input.getCoverage());
        item.setReminderDays(input.getReminderDays());
        return warrantyRepository.save(item);
    }
    public void delete(Long assetId, Long id) { warrantyRepository.delete(get(assetId, id)); }
    public Warranty upload(Long assetId, Long id, MultipartFile file) throws IOException {
        Warranty item = get(assetId, id);
        if (file.isEmpty() || file.getSize() > 5 * 1024 * 1024)
            throw new IllegalArgumentException("Choose a receipt between 1 byte and 5 MB");
        byte[] data = file.getBytes();
        String type;
        String extension;
        if (data.length > 4 && data[0] == '%' && data[1] == 'P' && data[2] == 'D' && data[3] == 'F') {
            type = "application/pdf"; extension = ".pdf";
        } else if (data.length > 8 && data[0] == (byte)137 && data[1] == 80 && data[2] == 78 && data[3] == 71
                && data[4] == 13 && data[5] == 10 && data[6] == 26 && data[7] == 10) {
            type = "image/png"; extension = ".png";
        } else if (data.length > 3 && data[0] == (byte)255 && data[1] == (byte)216 && data[2] == (byte)255) {
            type = "image/jpeg"; extension = ".jpg";
        } else throw new IllegalArgumentException("Choose a PDF, PNG or JPEG receipt");
        item.setReceiptData(data);
        item.setReceiptName("Receipt" + extension);
        item.setReceiptType(type);
        return warrantyRepository.save(item);
    }
    public void removeReceipt(Long assetId, Long id) {
        Warranty item = get(assetId, id);
        item.setReceiptData(null); item.setReceiptName(null); item.setReceiptType(null);
        warrantyRepository.save(item);
    }
}

