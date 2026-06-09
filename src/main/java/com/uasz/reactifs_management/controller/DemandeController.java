package com.uasz.reactifs_management.controller;

import com.uasz.reactifs_management.dto.DemandeRequest;
import com.uasz.reactifs_management.dto.DemandeResponse;
import com.uasz.reactifs_management.entity.Utilisateur;
import com.uasz.reactifs_management.service.DemandeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/demandes")
@RequiredArgsConstructor
public class DemandeController {

    private final DemandeService demandeService;

    @PostMapping
    public ResponseEntity<DemandeResponse> creer(@Valid @RequestBody DemandeRequest req,
                                                  @AuthenticationPrincipal Utilisateur utilisateur) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(demandeService.creer(req, utilisateur));
    }

    // Major valide ou rejette
    @PutMapping("/{id}/valider")
    public ResponseEntity<DemandeResponse> valider(@PathVariable Long id,
                                                    @RequestParam boolean approuver,
                                                    @RequestParam(required = false) String commentaire,
                                                    @AuthenticationPrincipal Utilisateur utilisateur) {
        return ResponseEntity.ok(demandeService.valider(id, approuver, commentaire, utilisateur));
    }

    // Magasinier traite (distribue le stock)
    @PutMapping("/{id}/traiter")
    public ResponseEntity<DemandeResponse> traiter(@PathVariable Long id,
                                                    @AuthenticationPrincipal Utilisateur utilisateur) {
        return ResponseEntity.ok(demandeService.traiter(id, utilisateur));
    }

    @GetMapping("/mes-demandes")
    public ResponseEntity<List<DemandeResponse>> getMesDemandes(
            @AuthenticationPrincipal Utilisateur utilisateur) {
        return ResponseEntity.ok(demandeService.getMesDemandes(utilisateur.getId()));
    }

    @GetMapping("/en-attente")
    public ResponseEntity<List<DemandeResponse>> getEnAttente() {
        return ResponseEntity.ok(demandeService.getDemandesEnAttente());
    }

    @GetMapping("/validees")
    public ResponseEntity<List<DemandeResponse>> getValidees() {
        return ResponseEntity.ok(demandeService.getDemandesValidees());
    }
}
