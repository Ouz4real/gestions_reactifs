package com.uasz.reactifs_management.dto;

public record DashboardStatsResponse(
        long totalProduits,
        long totalLots,
        long mouvementsAujourdhui,
        long demandesEnAttente,
        long demandesValidees,
        long produitsEnAlerte,
        long lotsPerimantBientot
) {}
