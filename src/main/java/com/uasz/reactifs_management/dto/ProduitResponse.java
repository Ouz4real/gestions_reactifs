package com.uasz.reactifs_management.dto;

import com.uasz.reactifs_management.entity.CategorieProduit;

public record ProduitResponse(
        Long id,
        String nom,
        CategorieProduit categorie,
        String type,
        String unite,
        String temperatureConservation,
        String description,
        String fournisseur,
        Integer seuilAlerte,
        Integer stockTotal,
        boolean enAlerte
) {}
