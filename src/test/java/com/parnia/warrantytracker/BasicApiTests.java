package com.parnia.warrantytracker;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class BasicApiTests {

    @Autowired
    MockMvc mvc;

    @Test
    void creatingValidAssetReturnsCreated() throws Exception {
        String body = """
                {"name":"Desk monitor","category":"Electronics","manufacturer":"Example","modelNumber":"M100"}
                """;

        mvc.perform(post("/api/assets")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Desk monitor"));
    }

    @Test
    void blankAssetNameReturnsBadRequest() throws Exception {
        String body = """
                {"name":"","category":"Electronics","manufacturer":"Example","modelNumber":"M100"}
                """;

        mvc.perform(post("/api/assets")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void warrantyForMissingAssetReturnsNotFound() throws Exception {
        String body = """
                {"provider":"Example Care","startDate":"2026-09-01","endDate":"2027-09-01"}
                """;

        mvc.perform(post("/api/assets/999999999/warranties")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isNotFound());
    }
}
