package com.parnia.warrantytracker.service;

import com.parnia.warrantytracker.model.*;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.util.*;

@Service
public class LookupService {
    private final AssetService assets;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private final JsonMapper mapper = JsonMapper.builder().build();
    private final String cpscUrl;
    private final String nhtsaUrl;
    public LookupService(AssetService assets,
                         @Value("${lookup.cpsc.url:https://www.saferproducts.gov/RestWebServices/Recall}") String cpscUrl,
                         @Value("${lookup.nhtsa.url:https://api.nhtsa.gov/recalls/recallsByVehicle}") String nhtsaUrl) {
        this.assets = assets; this.cpscUrl = cpscUrl; this.nhtsaUrl = nhtsaUrl;
    }
    public record RecallLookup(boolean available, String source, String message, List<Recall> results) {}
    public record PartLink(String name, String url) {}
    private String encode(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
    private String clip(String value, int length) { return value.substring(0, Math.min(length, value.length())); }
    public List<PartLink> parts(Long assetId, String query) {
        Asset asset = assets.getAsset(assetId);
        if (query.length() > 120) throw new IllegalArgumentException("Keep the part description under 120 characters");
        String search = encode(asset.getManufacturer() + " " + asset.getModelNumber() + " " + query + " replacement parts");
        return List.of(new PartLink("Find parts for this model", "https://www.google.com/search?q=" + search),
                new PartLink("Find the manufacturer parts page", "https://www.google.com/search?q=" +
                        encode(asset.getManufacturer() + " official replacement parts " + asset.getModelNumber() + " " + query)));
    }
    public RecallLookup recalls(Long assetId) {
        Asset asset = assets.getAsset(assetId);
        boolean vehicle = "Vehicles".equals(asset.getCategory());
        String source = vehicle ? "NHTSA" : "CPSC";
        if (vehicle && asset.getModelYear() == null)
            return new RecallLookup(false, source, "Add the vehicle model year to check recalls", List.of());
        String url = vehicle
                ? nhtsaUrl + "?make=" + encode(asset.getManufacturer()) + "&model=" + encode(asset.getModelNumber()) + "&modelYear=" + asset.getModelYear()
                : cpscUrl + "?format=json&Manufacturer=" + encode(asset.getManufacturer()) + "&RecallDescription=" + encode(asset.getModelNumber());
        try {
            HttpResponse<String> response = client.send(HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(12)).header("Accept", "application/json").GET().build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) throw new IllegalStateException();
            JsonNode json = mapper.readTree(response.body());
            JsonNode rows = vehicle ? json.path("results") : json;
            if (!rows.isArray()) throw new IllegalStateException();
            List<Recall> result = new ArrayList<>();
            for (JsonNode row : rows) {
                if (result.size() == 30) break;
                Recall recall = new Recall();
                recall.setTitle(clip(row.path(vehicle ? "Component" : "Title").asText("Recall notice"), 300));
                recall.setDescription(clip(row.path(vehicle ? "Summary" : "Description").asText(""), 10000));
                recall.setSource(source);
                recall.setSourceId(clip(row.path(vehicle ? "NHTSACampaignNumber" : "RecallNumber").asText(""), 120));
                String link = vehicle ? "https://www.nhtsa.gov/recalls?nhtsaId=" + encode(recall.getSourceId()) : row.path("URL").asText("");
                recall.setSourceUrl(link.startsWith("https://") ? clip(link, 1000) : null);
                if (!vehicle) {
                    String date = row.path("RecallDate").asText("");
                    if (date.length() >= 10) {
                        try { recall.setRecallDate(LocalDate.parse(date.substring(0, 10))); }
                        catch (RuntimeException ignored) { }
                    }
                }
                result.add(recall);
            }
            return new RecallLookup(true, source,
                    "Potential matches from US recall records. Confirm your exact model and serial number with the manufacturer.", result);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            return unavailable(source);
        } catch (Exception ex) { return unavailable(source); }
    }
    private RecallLookup unavailable(String source) {
        return new RecallLookup(false, source, "The recall source is unavailable. Try again later or check the official recall website.", List.of());
    }
}

