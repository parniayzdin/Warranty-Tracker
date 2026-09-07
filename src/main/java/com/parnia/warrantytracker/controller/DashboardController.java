package com.parnia.warrantytracker.controller;
import com.parnia.warrantytracker.service.DashboardService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {
    private final DashboardService service;
    public DashboardController(DashboardService service) { this.service = service; }
    @GetMapping("/dashboard")
    public DashboardService.Dashboard dashboard() { return service.dashboard(); }
    @GetMapping("/reminders")
    public List<DashboardService.Reminder> reminders() { return service.reminders(); }
    @GetMapping("/health")
    public Map<String, String> health() { service.dashboard(); return Map.of("status", "Ready"); }
}

