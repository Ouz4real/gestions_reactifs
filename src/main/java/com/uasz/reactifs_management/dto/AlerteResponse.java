package com.uasz.reactifs_management.dto;

import java.util.List;

public record AlerteResponse(
        List<ProduitResponse> produitsEnAlerte,
        List<LotResponse> lotsPerimantBientot
) {}
