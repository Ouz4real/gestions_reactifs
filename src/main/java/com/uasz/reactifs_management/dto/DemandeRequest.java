package com.uasz.reactifs_management.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record DemandeRequest(
        @NotNull Long produitId,
        @NotNull @Positive Integer quantiteDemandee,
        String motif
) {}
