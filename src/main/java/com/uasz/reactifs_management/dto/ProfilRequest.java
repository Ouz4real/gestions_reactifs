package com.uasz.reactifs_management.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ProfilRequest(
        @NotBlank String nom,
        @NotBlank String prenom,
        @Email @NotBlank String email,
        String ancienMotDePasse,   // requis si on change le mot de passe
        String nouveauMotDePasse   // optionnel
) {}
