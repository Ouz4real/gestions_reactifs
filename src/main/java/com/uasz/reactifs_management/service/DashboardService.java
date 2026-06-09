package com.uasz.reactifs_management.service;

import com.uasz.reactifs_management.dto.DashboardStatsResponse;
import com.uasz.reactifs_management.entity.StatutDemande;
import com.uasz.reactifs_management.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final ProduitRepository produitRepository;
    private final LotRepository lotRepository;
    private final MouvementRepository mouvementRepository;
    private final DemandeRepository demandeRepository;

    public DashboardStatsResponse getStats() {
        LocalDateTime debutJour = LocalDate.now().atStartOfDay();
        LocalDateTime finJour   = debutJour.plusDays(1);
        LocalDate limite60j     = LocalDate.now().plusDays(60);

        return new DashboardStatsResponse(
                produitRepository.count(),
                lotRepository.count(),
                mouvementRepository.countByDateMouvementBetween(debutJour, finJour),
                demandeRepository.findByStatutOrderByDateCreationDesc(StatutDemande.EN_ATTENTE).size(),
                demandeRepository.findByStatutOrderByDateCreationDesc(StatutDemande.VALIDEE).size(),
                produitRepository.findProduitsEnAlerte().size(),
                lotRepository.findLotsPerimantAvant(limite60j).size()
        );
    }

    /**
     * Retourne les mouvements groupés par jour entre deux dates.
     * Par défaut : 30 derniers jours.
     */
    public List<Map<String, Object>> getMouvementsParPeriode(LocalDate debut, LocalDate fin) {
        LocalDateTime debutDT = debut.atStartOfDay();
        LocalDateTime finDT = fin.plusDays(1).atStartOfDay();
        List<Object[]> rows = mouvementRepository.countByDayAndType(debutDT, finDT);

        // Initialiser tous les jours de la période à 0
        Map<String, Map<String, Object>> map = new LinkedHashMap<>();
        LocalDate current = debut;
        while (!current.isAfter(fin)) {
            String date = current.toString();
            Map<String, Object> day = new LinkedHashMap<>();
            day.put("date", date);
            day.put("entrees", 0);
            day.put("sorties", 0);
            map.put(date, day);
            current = current.plusDays(1);
        }

        for (Object[] row : rows) {
            String date = row[0].toString();
            String type = row[1].toString();
            long count = ((Number) row[2]).longValue();
            if (map.containsKey(date)) {
                if ("ENTREE".equals(type)) map.get(date).put("entrees", count);
                else                       map.get(date).put("sorties", count);
            }
        }

        return List.copyOf(map.values());
    }

    @Deprecated
    public List<Map<String, Object>> getMouvements7Jours() {
        LocalDate fin = LocalDate.now();
        LocalDate debut = fin.minusDays(6);
        return getMouvementsParPeriode(debut, fin);
    }
}
