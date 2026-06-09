package com.uasz.reactifs_management.dto;

import com.uasz.reactifs_management.entity.CategorieProduit;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProduitRequest(
        @NotBlank String nom,
        @NotNull CategorieProduit categorie,
        String type,
        String unite,
        String temperatureConservation,
        String description,
        String fournisseur,
        Integer seuilAlerte
) {}
