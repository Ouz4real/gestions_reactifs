package com.uasz.reactifs_management.controller;

import com.uasz.reactifs_management.dto.AlerteResponse;
import com.uasz.reactifs_management.dto.ConsommationRequest;
import com.uasz.reactifs_management.dto.MouvementResponse;
import com.uasz.reactifs_management.entity.Utilisateur;
import com.uasz.reactifs_management.service.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @PostMapping("/consommer")
    public ResponseEntity<Void> consommer(@Valid @RequestBody ConsommationRequest req,
                                          @AuthenticationPrincipal Utilisateur utilisateur) {
        stockService.consommer(req, utilisateur);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/historique")
    public ResponseEntity<List<MouvementResponse>> getHistoriqueComplet() {
        return ResponseEntity.ok(stockService.getHistoriqueComplet());
    }

    @GetMapping("/historique/{produitId}")
    public ResponseEntity<List<MouvementResponse>> getHistoriqueProduit(@PathVariable Long produitId) {
        return ResponseEntity.ok(stockService.getHistorique(produitId));
    }

    @GetMapping("/alertes")
    public ResponseEntity<AlerteResponse> getAlertes() {
        return ResponseEntity.ok(stockService.getAlertes());
    }

    @GetMapping("/total/{produitId}")
    public ResponseEntity<Integer> getStockTotal(@PathVariable Long produitId) {
        return ResponseEntity.ok(stockService.getStockTotal(produitId));
    }
}
