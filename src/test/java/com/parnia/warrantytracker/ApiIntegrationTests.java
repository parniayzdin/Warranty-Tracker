package com.parnia.warrantytracker;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;
import java.time.LocalDate;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ApiIntegrationTests {
    @Autowired MockMvc mvc;
    private final JsonMapper json = JsonMapper.builder().build();
    private static final String ASSET = """
        {"name":"Kitchen fridge","category":"Appliances","manufacturer":"Example","modelNumber":"F100"}
        """;
    private long asset() throws Exception {
        String body = mvc.perform(post("/api/assets").contentType("application/json").content(ASSET))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return json.readTree(body).path("id").asLong();
    }
    private long create(String path, String body) throws Exception {
        return json.readTree(mvc.perform(post(path).contentType("application/json").content(body))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString()).path("id").asLong();
    }
    @Test void assetsSupportCrudAndMissingRecordsReturn404() throws Exception {
        long id = asset();
        mvc.perform(get("/api/assets/" + id)).andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Kitchen fridge"));
        mvc.perform(put("/api/assets/" + id).contentType("application/json").content(ASSET.replace("Kitchen fridge", "Office fridge")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Office fridge"));
        mvc.perform(delete("/api/assets/" + id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/assets/" + id)).andExpect(status().isNotFound());
        mvc.perform(delete("/api/assets/" + id)).andExpect(status().isNotFound());
        mvc.perform(get("/api/assets/" + id + "/warranties")).andExpect(status().isNotFound());
    }
    @Test void invalidAssetAndMalformedDatesReturn400() throws Exception {
        mvc.perform(post("/api/assets").contentType("application/json").content("{}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.name").exists());
        mvc.perform(post("/api/assets").contentType("application/json").content(ASSET.replace("Appliances", "Invalid")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/assets").contentType("application/json").content(ASSET.replace("}", ",\"purchaseDate\":\"tomorrow\"}")))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/assets/wrong")).andExpect(status().isBadRequest());
    }
    @Test void warrantiesValidateDatesAndOwnershipAndSupportReceipts() throws Exception {
        long id = asset();
        String path = "/api/assets/" + id + "/warranties";
        String body = "{\"provider\":\"Example Care\",\"startDate\":\"" + LocalDate.now().minusDays(1) + "\",\"endDate\":\"" + LocalDate.now().plusDays(20) + "\"}";
        long warranty = create(path, body);
        mvc.perform(get(path + "/" + warranty)).andExpect(jsonPath("$.status").value("Expiring soon"));
        mvc.perform(get("/api/assets/" + asset() + "/warranties/" + warranty)).andExpect(status().isNotFound());
        mvc.perform(post(path).contentType("application/json").content("{\"provider\":\"Care\",\"startDate\":\"2026-09-01\",\"endDate\":\"2020-01-01\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(put(path + "/" + warranty).contentType("application/json").content(body.replace("Example Care", "Extended Care")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.provider").value("Extended Care"));
        byte[] receipt = "%PDF sample receipt".getBytes();
        mvc.perform(multipart(path + "/" + warranty + "/receipt").file(new MockMultipartFile("file", "receipt.pdf", "application/pdf", receipt)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.receiptName").value("Receipt.pdf")).andExpect(jsonPath("$.receiptData").doesNotExist());
        mvc.perform(get(path + "/" + warranty + "/receipt")).andExpect(status().isOk()).andExpect(content().bytes(receipt));
        mvc.perform(multipart(path + "/" + warranty + "/receipt").file(new MockMultipartFile("file", "fake.pdf", "application/pdf", "<script>".getBytes())))
                .andExpect(status().isBadRequest());
        mvc.perform(delete(path + "/" + warranty + "/receipt")).andExpect(status().isNoContent());
        mvc.perform(get(path + "/" + warranty + "/receipt")).andExpect(status().isNotFound());
        mvc.perform(delete(path + "/" + warranty)).andExpect(status().isNoContent());
    }
    @Test void maintenanceCompletionReschedulesAndPreventsDuplicateCompletion() throws Exception {
        long id = asset();
        String path = "/api/assets/" + id + "/maintenance";
        long task = create(path, "{\"title\":\"Clean filter\",\"nextDueDate\":\"" + LocalDate.now().minusDays(2) + "\",\"intervalDays\":30}");
        mvc.perform(get(path + "/" + task)).andExpect(jsonPath("$.status").value("Overdue"));
        mvc.perform(post(path + "/" + task + "/complete")).andExpect(status().isOk())
                .andExpect(jsonPath("$.lastCompletedDate").value(LocalDate.now().toString()))
                .andExpect(jsonPath("$.nextDueDate").value(LocalDate.now().plusDays(30).toString()));
        mvc.perform(post(path + "/" + task + "/complete")).andExpect(status().isBadRequest());
        long once = create(path, "{\"title\":\"Inspect hose\",\"nextDueDate\":\"" + LocalDate.now() + "\"}");
        mvc.perform(post(path + "/" + once + "/complete")).andExpect(jsonPath("$.status").value("Completed"));
        mvc.perform(get("/api/reminders")).andExpect(jsonPath("$[?(@.title == 'Inspect hose')]").isEmpty());
    }
    @Test void dashboardReflectsSavedDataAndDeletingAssetRemovesChildren() throws Exception {
        long id = asset();
        String path = "/api/assets/" + id;
        create(path + "/recalls", "{\"title\":\"Service notice\",\"source\":\"Manufacturer\",\"sourceUrl\":\"https://example.com/notice\",\"status\":\"Open\"}");
        create(path + "/parts", "{\"name\":\"Filter\",\"url\":\"https://example.com/parts\"}");
        create(path + "/maintenance", "{\"title\":\"Check filter\",\"nextDueDate\":\"" + LocalDate.now() + "\"}");
        create(path + "/warranties", "{\"provider\":\"Care\",\"startDate\":\"" + LocalDate.now() + "\",\"endDate\":\"" + LocalDate.now().plusDays(10) + "\"}");
        mvc.perform(get("/api/dashboard")).andExpect(status().isOk()).andExpect(jsonPath("$.assetCount", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.protectedCount", greaterThanOrEqualTo(1))).andExpect(jsonPath("$.recallCount", greaterThanOrEqualTo(1)));
        mvc.perform(delete(path)).andExpect(status().isNoContent());
        mvc.perform(get(path + "/maintenance")).andExpect(status().isNotFound());
        mvc.perform(get("/api/reminders")).andExpect(jsonPath("$[?(@.asset.id == " + id + ")]").isEmpty());
    }
    @Test void recallAndPartCrudAndUnsafeUrls() throws Exception {
        String path = "/api/assets/" + asset();
        long recall = create(path + "/recalls", "{\"title\":\"Notice\",\"source\":\"Manufacturer\",\"status\":\"Open\"}");
        mvc.perform(put(path + "/recalls/" + recall).contentType("application/json").content("{\"title\":\"Notice\",\"source\":\"Manufacturer\",\"status\":\"Resolved\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("Resolved"));
        long part = create(path + "/parts", "{\"name\":\"Filter\"}");
        mvc.perform(put(path + "/parts/" + part).contentType("application/json").content("{\"name\":\"New filter\",\"url\":\"https://example.com/parts\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.name").value("New filter"));
        mvc.perform(post(path + "/parts").contentType("application/json").content("{\"name\":\"Bad link\",\"url\":\"javascript:alert(1)\"}")).andExpect(status().isBadRequest());
        mvc.perform(get(path + "/parts/lookup").param("query", "filter")).andExpect(status().isOk()).andExpect(jsonPath("$[0].url", containsString("F100")));
        mvc.perform(delete(path + "/recalls/" + recall)).andExpect(status().isNoContent());
        mvc.perform(delete(path + "/parts/" + part)).andExpect(status().isNoContent());
    }
}

