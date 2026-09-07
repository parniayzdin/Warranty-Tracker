package com.parnia.warrantytracker.controller;

import com.parnia.warrantytracker.model.Warranty;
import com.parnia.warrantytracker.service.WarrantyService;
import com.parnia.warrantytracker.exception.NotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/assets/{assetId}/warranties")
public class WarrantyController {
    private final WarrantyService warrantyService;
    public WarrantyController(WarrantyService warrantyService) { this.warrantyService = warrantyService; }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public Warranty addWarranty(@PathVariable Long assetId, @Valid @RequestBody Warranty warranty) {
        return warrantyService.addWarrantyToAsset(assetId, warranty);
    }
    @GetMapping
    public List<Warranty> list(@PathVariable Long assetId) { return warrantyService.list(assetId); }
    @GetMapping("/{id}")
    public Warranty get(@PathVariable Long assetId, @PathVariable Long id) { return warrantyService.get(assetId, id); }
    @PutMapping("/{id}")
    public Warranty update(@PathVariable Long assetId, @PathVariable Long id, @Valid @RequestBody Warranty warranty) {
        return warrantyService.update(assetId, id, warranty);
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long assetId, @PathVariable Long id) { warrantyService.delete(assetId, id); }
    @PostMapping(value = "/{id}/receipt", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Warranty upload(@PathVariable Long assetId, @PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {
        return warrantyService.upload(assetId, id, file);
    }
    @GetMapping("/{id}/receipt")
    public ResponseEntity<byte[]> receipt(@PathVariable Long assetId, @PathVariable Long id) {
        Warranty item = warrantyService.get(assetId, id);
        if (item.getReceiptData() == null) throw new NotFoundException("Receipt");
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(item.getReceiptType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(item.getReceiptName()).build().toString())
                .header("X-Content-Type-Options", "nosniff")
                .body(item.getReceiptData());
    }
    @DeleteMapping("/{id}/receipt") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeReceipt(@PathVariable Long assetId, @PathVariable Long id) { warrantyService.removeReceipt(assetId, id); }
}

