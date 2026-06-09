package com.uasz.reactifs_management.controller;

import com.uasz.reactifs_management.dto.LotRequest;
import com.uasz.reactifs_management.dto.LotResponse;
import com.uasz.reactifs_management.entity.Utilisateur;
import com.uasz.reactifs_management.service.LotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lots")
@RequiredArgsConstructor
public class LotController {

    private final LotService lotService;

    @PostMapping
    public ResponseEntity<LotResponse> create(@Valid @RequestBody LotRequest req,
                                               @AuthenticationPrincipal Utilisateur utilisateur) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lotService.create(req, utilisateur));
    }

    @GetMapping("/produit/{produitId}")
    public ResponseEntity<List<LotResponse>> getByProduit(@PathVariable Long produitId) {
        return ResponseEntity.ok(lotService.getByProduit(produitId));
    }

    @GetMapping("/peremption-proche")
    public ResponseEntity<List<LotResponse>> getLotsPerimantBientot() {
        return ResponseEntity.ok(lotService.getLotsPerimantBientot());
    }
}
