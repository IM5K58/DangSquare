package com.inha.netzero.sample.presentation;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.inha.netzero.sample.application.SampleService;
import com.inha.netzero.sample.domain.Sample;
import com.inha.netzero.sample.presentation.dto.SampleRequest;
import com.inha.netzero.sample.presentation.dto.SampleResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/samples")
public class SampleController {

    private final SampleService sampleService;

    public SampleController(SampleService sampleService) {
        this.sampleService = sampleService;
    }

    @GetMapping
    public List<SampleResponse> list() {
        return sampleService.findAll().stream()
                .map(SampleResponse::from)
                .toList();
    }

    @PostMapping
    public ResponseEntity<SampleResponse> create(@Valid @RequestBody SampleRequest request) {
        Sample created = sampleService.create(request.name());
        SampleResponse response = SampleResponse.from(created);
        return ResponseEntity.created(URI.create("/api/samples/" + response.id())).body(response);
    }
}
