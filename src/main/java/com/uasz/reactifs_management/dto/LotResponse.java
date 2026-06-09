package com.uasz.reactifs_management.dto;

import java.time.LocalDate;

public record LotResponse(
        Long id,
        String numeroLot,
        LocalDate dateFabrication,
        LocalDate datePeremption,
        LocalDate dateAcquisition,
        Integer quantiteInitiale,
        Integer quantiteRestante,
        boolean actif,
        Long produitId,
        String produitNom,
        boolean perimeOuProche  // true si péremption dans <= 60 jours
) {}
