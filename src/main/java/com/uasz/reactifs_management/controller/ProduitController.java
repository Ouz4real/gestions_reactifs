package com.uasz.reactifs_management.controller;

import com.uasz.reactifs_management.dto.ProduitRequest;
import com.uasz.reactifs_management.dto.ProduitResponse;
import com.uasz.reactifs_management.service.ProduitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produits")
@RequiredArgsConstructor
public class ProduitController {

    private final ProduitService produitService;

    @PostMapping
    public ResponseEntity<ProduitResponse> create(@Valid @RequestBody ProduitRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(produitService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProduitResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody ProduitRequest req) {
        return ResponseEntity.ok(produitService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        produitService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ProduitResponse>> getAll() {
        return ResponseEntity.ok(produitService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProduitResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(produitService.findOne(id));
    }
}
