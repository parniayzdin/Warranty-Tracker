package com.parnia.warrantytracker.controller;
import com.parnia.warrantytracker.service.DemoService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/demo")
public class DemoController {
    private final DemoService service;
    public DemoController(DemoService service) { this.service = service; }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public void create() { service.create(); }
}

