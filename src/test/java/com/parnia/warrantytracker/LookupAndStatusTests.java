package com.parnia.warrantytracker;

import com.parnia.warrantytracker.model.Asset;
import com.parnia.warrantytracker.model.Warranty;
import com.parnia.warrantytracker.service.AssetService;
import com.parnia.warrantytracker.service.LookupService;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LookupAndStatusTests {
    private HttpServer server;
    private AssetService assets;
    private String endpoint;
    private final AtomicReference<String> query = new AtomicReference<>();
    @BeforeEach void setup() throws Exception {
        assets = mock(AssetService.class);
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        endpoint = "http://127.0.0.1:" + server.getAddress().getPort() + "/recalls";
    }
    private void respond(int status, String body) {
        server.createContext("/recalls", exchange -> {
            query.set(exchange.getRequestURI().getRawQuery());
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        });
        server.start();
    }
    @AfterEach void stop() { server.stop(0); }
    @Test void consumerLookupUsesBothManufacturerAndModel() {
        when(assets.getAsset(1L)).thenReturn(new Asset("Fridge", "Appliances", "Brand & Co", "Model 100"));
        respond(200, """
            [{"Title":"Product notice","RecallNumber":"100","Description":"Check model","URL":"https://www.cpsc.gov/Recalls/notice","RecallDate":"2026-01-01T00:00:00"}]
            """);
        var result = new LookupService(assets, endpoint, endpoint).recalls(1L);
        assertTrue(result.available());
        assertEquals(1, result.results().size());
        assertEquals("CPSC", result.source());
        assertTrue(query.get().contains("Manufacturer=Brand+%26+Co"));
        assertTrue(query.get().contains("RecallDescription=Model+100"));
        assertEquals(LocalDate.of(2026,1,1), result.results().getFirst().getRecallDate());
    }
    @Test void vehicleLookupRequiresYearAndMapsRealProviderFields() {
        Asset car = new Asset("Car", "Vehicles", "Honda", "Civic");
        when(assets.getAsset(1L)).thenReturn(car);
        LookupService service = new LookupService(assets, endpoint, endpoint);
        assertFalse(service.recalls(1L).available());
        car.setModelYear(2020);
        respond(200, """
            {"results":[{"Component":"Fuel system","NHTSACampaignNumber":"20V001","Summary":"Manufacturer remedy available"}]}
            """);
        var result = service.recalls(1L);
        assertTrue(result.available());
        assertEquals("20V001", result.results().getFirst().getSourceId());
        assertTrue(query.get().contains("modelYear=2020"));
    }
    @Test void outageIsNotReportedAsNoRecalls() {
        when(assets.getAsset(1L)).thenReturn(new Asset("Fridge", "Appliances", "Brand", "Model"));
        respond(503, "{}");
        var result = new LookupService(assets, endpoint, endpoint).recalls(1L);
        assertFalse(result.available());
        assertTrue(result.message().contains("unavailable"));
    }
    @Test void malformedSourceResponseIsUnavailable() {
        when(assets.getAsset(1L)).thenReturn(new Asset("Fridge", "Appliances", "Brand", "Model"));
        respond(200, "<html>Unavailable</html>");
        assertFalse(new LookupService(assets, endpoint, endpoint).recalls(1L).available());
    }
    @Test void warrantyStatusHonorsInclusiveEndDateAndFutureStart() {
        LocalDate today = LocalDate.now();
        Warranty warranty = new Warranty("Care", today.minusDays(1), today, null);
        assertEquals("Expiring soon", warranty.getStatus());
        warranty.setEndDate(today.minusDays(1));
        assertEquals("Expired", warranty.getStatus());
        warranty.setStartDate(today.plusDays(1));
        warranty.setEndDate(today.plusDays(300));
        assertEquals("Scheduled", warranty.getStatus());
        warranty.setStartDate(today);
        assertEquals("Active", warranty.getStatus());
    }
}

