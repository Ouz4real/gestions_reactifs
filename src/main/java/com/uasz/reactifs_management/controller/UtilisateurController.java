package com.uasz.reactifs_management.controller;

import com.uasz.reactifs_management.dto.UtilisateurRequest;
import com.uasz.reactifs_management.dto.UtilisateurResponse;
import com.uasz.reactifs_management.entity.Role;
import com.uasz.reactifs_management.service.UtilisateurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    @PostMapping
    public ResponseEntity<UtilisateurResponse> create(@Valid @RequestBody UtilisateurRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(utilisateurService.create(req));
    }

    @GetMapping
    public ResponseEntity<List<UtilisateurResponse>> getAll() {
        return ResponseEntity.ok(utilisateurService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UtilisateurResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateurService.findOne(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UtilisateurResponse> update(@PathVariable Long id,
                                                       @Valid @RequestBody UtilisateurRequest req) {
        return ResponseEntity.ok(utilisateurService.update(id, req));
    }

    @PutMapping("/{id}/toggle-actif")
    public ResponseEntity<UtilisateurResponse> toggleActif(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateurService.toggleActif(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        utilisateurService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UtilisateurResponse> updateRole(@PathVariable Long id,
                                                           @RequestParam Role role) {
        return ResponseEntity.ok(utilisateurService.updateRole(id, role));
    }
}
