package com.uasz.reactifs_management.service;

import com.uasz.reactifs_management.dto.UtilisateurRequest;
import com.uasz.reactifs_management.dto.UtilisateurResponse;
import com.uasz.reactifs_management.dto.ProfilRequest;
import com.uasz.reactifs_management.entity.Utilisateur;
import com.uasz.reactifs_management.repository.UtilisateurRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UtilisateurResponse create(UtilisateurRequest req) {
        if (utilisateurRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email déjà utilisé : " + req.email());
        }
        Utilisateur u = Utilisateur.builder()
                .nom(req.nom())
                .prenom(req.prenom())
                .email(req.email())
                .motDePasse(passwordEncoder.encode(req.motDePasse()))
                .role(req.role())
                .build();
        return toResponse(utilisateurRepository.save(u));
    }

    @Transactional
    public UtilisateurResponse toggleActif(Long id) {
        Utilisateur u = findById(id);
        u.setActif(!u.isActif());
        return toResponse(utilisateurRepository.save(u));
    }

    @Transactional
    public UtilisateurResponse updateProfil(Utilisateur current, ProfilRequest req) {
        // Vérifier l'ancien mot de passe si changement demandé
        if (req.nouveauMotDePasse() != null && !req.nouveauMotDePasse().isBlank()) {
            if (req.ancienMotDePasse() == null ||
                !passwordEncoder.matches(req.ancienMotDePasse(), current.getMotDePasse())) {
                throw new IllegalArgumentException("Ancien mot de passe incorrect.");
            }
            current.setMotDePasse(passwordEncoder.encode(req.nouveauMotDePasse()));
        }
        current.setNom(req.nom());
        current.setPrenom(req.prenom());
        current.setEmail(req.email());
        return toResponse(utilisateurRepository.save(current));
    }

    @Transactional
    public UtilisateurResponse update(Long id, UtilisateurRequest req) {
        Utilisateur u = findById(id);
        u.setNom(req.nom());
        u.setPrenom(req.prenom());
        u.setEmail(req.email());
        if (req.motDePasse() != null && !req.motDePasse().isBlank()) {
            u.setMotDePasse(passwordEncoder.encode(req.motDePasse()));
        }
        u.setRole(req.role());
        return toResponse(utilisateurRepository.save(u));
    }

    @Transactional
    public void delete(Long id) {
        utilisateurRepository.deleteById(id);
    }

    @Transactional
    public UtilisateurResponse updateRole(Long id, com.uasz.reactifs_management.entity.Role role) {
        Utilisateur u = findById(id);
        u.setRole(role);
        return toResponse(utilisateurRepository.save(u));
    }

    public List<UtilisateurResponse> findAll() {
        return utilisateurRepository.findAll().stream().map(this::toResponse).toList();
    }

    public UtilisateurResponse findOne(Long id) {
        return toResponse(findById(id));
    }

    public Utilisateur findById(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable : " + id));
    }

    private UtilisateurResponse toResponse(Utilisateur u) {
        return new UtilisateurResponse(u.getId(), u.getNom(), u.getPrenom(),
                u.getEmail(), u.getRole(), u.isActif());
    }
}
