package com.uasz.reactifs_management.dto;

import com.uasz.reactifs_management.entity.StatutDemande;

import java.time.LocalDateTime;

public record DemandeResponse(
        Long id,
        Long produitId,
        String produitNom,
        Integer quantiteDemandee,
        String motif,
        StatutDemande statut,
        String demandeurNom,
        String valideurNom,
        LocalDateTime dateCreation,
        LocalDateTime dateValidation,
        String commentaireValidation
) {}
