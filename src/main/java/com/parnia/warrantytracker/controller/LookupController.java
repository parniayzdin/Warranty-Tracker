package com.parnia.warrantytracker.controller;
import com.parnia.warrantytracker.service.LookupService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/assets/{assetId}")
public class LookupController {
    private final LookupService service;
    public LookupController(LookupService service) { this.service = service; }
    @GetMapping("/recalls/lookup")
    public LookupService.RecallLookup recalls(@PathVariable Long assetId) { return service.recalls(assetId); }
    @GetMapping("/parts/lookup")
    public List<LookupService.PartLink> parts(@PathVariable Long assetId, @RequestParam(defaultValue = "") String query) { return service.parts(assetId, query); }
}

