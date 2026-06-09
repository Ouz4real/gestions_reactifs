package com.uasz.reactifs_management.dto;

import com.uasz.reactifs_management.entity.TypeMouvement;

import java.time.LocalDateTime;

public record MouvementResponse(
        Long id,
        LocalDateTime dateMouvement,
        Integer quantite,
        TypeMouvement type,
        String motif,
        Long produitId,
        String produitNom,
        Long lotId,
        String numeroLot,
        String utilisateurNom
) {}
