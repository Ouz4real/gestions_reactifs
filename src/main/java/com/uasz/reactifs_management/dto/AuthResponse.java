package com.uasz.reactifs_management.dto;

import com.uasz.reactifs_management.entity.Role;

public record AuthResponse(
        String token,
        String email,
        String nom,
        String prenom,
        Role role
) {}
