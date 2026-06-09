package com.uasz.reactifs_management.controller;

import com.uasz.reactifs_management.dto.DashboardStatsResponse;
import com.uasz.reactifs_management.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/mouvements")
    public ResponseEntity<List<Map<String, Object>>> getMouvements(
            @RequestParam(required = false) String debut,
            @RequestParam(required = false) String fin) {
        LocalDate dateFin = (fin != null) ? LocalDate.parse(fin) : LocalDate.now();
        LocalDate dateDebut = (debut != null) ? LocalDate.parse(debut) : dateFin.minusDays(29);
        return ResponseEntity.ok(dashboardService.getMouvementsParPeriode(dateDebut, dateFin));
    }

    // Conservé pour rétrocompatibilité
    @GetMapping("/mouvements-7j")
    public ResponseEntity<List<Map<String, Object>>> getMouvements7Jours() {
        return ResponseEntity.ok(dashboardService.getMouvements7Jours());
    }
}
