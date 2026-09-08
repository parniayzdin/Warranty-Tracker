package com.parnia.warrantytracker.service;

import com.parnia.warrantytracker.model.*;
import com.parnia.warrantytracker.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class DemoService {
    private final AssetRepository assets;
    private final WarrantyRepository warranties;
    private final MaintenanceRepository maintenance;
    public DemoService(AssetRepository assets, WarrantyRepository warranties, MaintenanceRepository maintenance) {
        this.assets = assets; this.warranties = warranties; this.maintenance = maintenance;
    }
    @Transactional
    public synchronized void create() {
        if (assets.count() != 0) throw new IllegalArgumentException("Sample items can only be added to an empty home");
        LocalDate today = LocalDate.now();
        List<Asset> items = List.of(
            new Asset("The kitchen fridge", "Appliances", "Sample Home", "Cool 200"),
            new Asset("Sunday headphones", "Electronics", "Sample Audio", "Sound 20"),
            new Asset("The family car", "Vehicles", "Sample Motors", "Everyday"),
            new Asset("Little bear stroller", "Baby products", "Sample Baby", "Stroll 10"),
            new Asset("Weekend toolbox", "Home equipment", "Sample Workshop", "Fix 50"),
            new Asset("The travel companion", "Other", "Sample Travel", "Carry 30")
        );
        String[] locations = {"Kitchen", "Living room", "Garage", "Hallway", "Utility room", "Bedroom"};
        for (int i = 0; i < items.size(); i++) {
            Asset item = items.get(i);
            item.setLocation(locations[i]);
            item.setPurchaseDate(today.minusMonths(4 + i));
            item.setNotes("Sample item for exploring your home. Edit or remove it whenever you like.");
            if ("Vehicles".equals(item.getCategory())) item.setModelYear(today.getYear() - 1);
            assets.save(item);
            if (i < 4) {
                Warranty warranty = new Warranty("Sample Care", today.minusMonths(4), today.plusDays(i == 0 ? 12 : 120 + i * 30), item);
                warranty.setCoverage("Sample coverage for exploring warranty tracking.");
                warranties.save(warranty);
            }
        }
        String[] tasks = {"Clean the fridge coils", "Check tire pressure", "Inspect stroller wheels"};
        int[] indexes = {0, 2, 3};
        int[] due = {2, 5, 9};
        for (int i = 0; i < tasks.length; i++) {
            Maintenance task = new Maintenance();
            task.setAsset(items.get(indexes[i]));
            task.setTitle(tasks[i]);
            task.setNextDueDate(today.plusDays(due[i]));
            task.setIntervalDays(i == 0 ? 180 : 30);
            task.setNotes("Sample schedule. Follow the manufacturer instructions for your actual item.");
            maintenance.save(task);
        }
    }
}

