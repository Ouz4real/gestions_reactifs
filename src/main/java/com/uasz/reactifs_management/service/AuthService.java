package com.uasz.reactifs_management.service;

import com.uasz.reactifs_management.config.JwtUtil;
import com.uasz.reactifs_management.dto.AuthRequest;
import com.uasz.reactifs_management.dto.AuthResponse;
import com.uasz.reactifs_management.entity.Utilisateur;
import com.uasz.reactifs_management.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(AuthRequest req) {
        Utilisateur user = utilisateurRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("Email ou mot de passe incorrect"));

        if (!user.isActif()) {
            throw new IllegalStateException("Compte désactivé");
        }

        if (!passwordEncoder.matches(req.motDePasse(), user.getMotDePasse())) {
            throw new IllegalArgumentException("Email ou mot de passe incorrect");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(token, user.getEmail(),
                user.getNom(), user.getPrenom(), user.getRole());
    }
}
