package com.parnia.warrantytracker.controller;

import com.parnia.warrantytracker.model.Warranty;
import com.parnia.warrantytracker.service.WarrantyService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assets")
public class WarrantyController {

    private final WarrantyService warrantyService;

    public WarrantyController(WarrantyService warrantyService) {
        this.warrantyService = warrantyService;
    }

    @PostMapping("/{assetId}/warranties")
    public Warranty addWarranty(
            @PathVariable Long assetId,
            @RequestBody Warranty warranty
    ) {
        return warrantyService.addWarrantyToAsset(assetId, warranty);
    }
}

//URL tells backend:
//        "Which asset?"
//
//        /api/assets/1/warranties
//            ↑
//Asset 1
//
//
//JSON tells backend:
//        "What warranty?"
//
//        {
//        "provider": "Samsung",
//        "startDate": "2026-05-01",
//        "endDate": "2028-05-01"
//        }