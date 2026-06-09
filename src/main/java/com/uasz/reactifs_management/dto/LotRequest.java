package com.uasz.reactifs_management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record LotRequest(
        @NotBlank String numeroLot,
        LocalDate dateFabrication,
        @NotNull LocalDate datePeremption,
        @NotNull LocalDate dateAcquisition,
        @NotNull @Positive Integer quantiteInitiale,
        @NotNull Long produitId,
        String motif
) {}
