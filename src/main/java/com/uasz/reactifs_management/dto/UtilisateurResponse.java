package com.uasz.reactifs_management.dto;

import com.uasz.reactifs_management.entity.Role;

public record UtilisateurResponse(
        Long id,
        String nom,
        String prenom,
        String email,
        Role role,
        boolean actif
) {}
