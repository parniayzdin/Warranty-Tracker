package com.parnia.warrantytracker.service;

import com.parnia.warrantytracker.model.*;
import com.parnia.warrantytracker.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {
    private final AssetRepository assets;
    private final WarrantyRepository warranties;
    private final MaintenanceRepository maintenance;
    private final RecallRepository recalls;
    public DashboardService(AssetRepository assets, WarrantyRepository warranties, MaintenanceRepository maintenance, RecallRepository recalls) {
        this.assets = assets; this.warranties = warranties; this.maintenance = maintenance; this.recalls = recalls;
    }
    public record Reminder(String type, Long id, Asset asset, String title, LocalDate dueDate, String status) {}
    public void checkDatabase() { assets.count(); }
    public record Dashboard(long assetCount, long protectedCount, long maintenanceCount, long recallCount,
                            Map<String, Long> categories, List<Asset> recentAssets, List<Reminder> reminders, List<Recall> recalls) {}
    public List<Reminder> reminders() {
        List<Reminder> result = new ArrayList<>();
        LocalDate today = LocalDate.now();
        warranties.findAll().stream().filter(w -> w.getEndDate() != null && !w.getEndDate().isAfter(today.plusDays(w.getReminderDays())))
                .forEach(w -> result.add(new Reminder("Warranty", w.getId(), w.getAsset(), w.getProvider(), w.getEndDate(), w.getStatus())));
        maintenance.findAll().stream().filter(m -> !m.isCompleted() && !m.getNextDueDate().isAfter(today.plusDays(30)))
                .forEach(m -> result.add(new Reminder("Maintenance", m.getId(), m.getAsset(), m.getTitle(), m.getNextDueDate(), m.getStatus())));
        result.sort(Comparator.comparing(Reminder::dueDate).thenComparing(Reminder::id));
        return result;
    }
    public Dashboard dashboard() {
        List<Asset> all = assets.findAll();
        List<Recall> open = recalls.findAll().stream().filter(r -> "Open".equals(r.getStatus())).toList();
        long protectedCount = warranties.findAll().stream().filter(w -> List.of("Active", "Expiring soon").contains(w.getStatus()))
                .map(w -> w.getAsset().getId()).distinct().count();
        List<Reminder> reminders = reminders();
        return new Dashboard(all.size(), protectedCount, reminders.stream().filter(r -> "Maintenance".equals(r.type())).count(), open.size(),
                all.stream().collect(Collectors.groupingBy(Asset::getCategory, TreeMap::new, Collectors.counting())),
                all.stream().sorted(Comparator.comparing(Asset::getId).reversed()).limit(4).toList(), reminders, open);
    }
}
