package com.uasz.reactifs_management.dto;

import com.uasz.reactifs_management.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UtilisateurRequest(
        @NotBlank String nom,
        @NotBlank String prenom,
        @Email @NotBlank String email,
        String motDePasse,   // optionnel en modification
        @NotNull Role role
) {}
