package com.uasz.reactifs_management.controller;

import com.uasz.reactifs_management.dto.AuthRequest;
import com.uasz.reactifs_management.dto.AuthResponse;
import com.uasz.reactifs_management.dto.UtilisateurRequest;
import com.uasz.reactifs_management.dto.UtilisateurResponse;
import com.uasz.reactifs_management.dto.ProfilRequest;
import com.uasz.reactifs_management.entity.Utilisateur;
import com.uasz.reactifs_management.service.AuthService;
import com.uasz.reactifs_management.service.UtilisateurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UtilisateurService utilisateurService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    // Accessible uniquement par l'admin (via SecurityConfig)
    @PostMapping("/register")
    public ResponseEntity<UtilisateurResponse> register(@Valid @RequestBody UtilisateurRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(utilisateurService.create(req));
    }

    // Modifier son propre profil — accessible à tous les connectés
    @PutMapping("/profil")
    public ResponseEntity<UtilisateurResponse> updateProfil(
            @Valid @RequestBody ProfilRequest req,
            @AuthenticationPrincipal Utilisateur utilisateur) {
        return ResponseEntity.ok(utilisateurService.updateProfil(utilisateur, req));
    }
}
