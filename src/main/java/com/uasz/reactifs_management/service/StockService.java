package com.uasz.reactifs_management.service;

import com.uasz.reactifs_management.dto.AlerteResponse;
import com.uasz.reactifs_management.dto.ConsommationRequest;
import com.uasz.reactifs_management.dto.MouvementResponse;
import com.uasz.reactifs_management.entity.*;
import com.uasz.reactifs_management.repository.LotRepository;
import com.uasz.reactifs_management.repository.MouvementRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockService {

    private final LotRepository lotRepository;
    private final MouvementRepository mouvementRepository;
    private final ProduitService produitService;
    private final LotService lotService;

    /**
     * Consommation FIFO : on consomme d'abord les lots dont la date de péremption
     * est la plus proche. Un mouvement de sortie est enregistré par lot consommé.
     */
    @Transactional
    public void consommer(ConsommationRequest req, Utilisateur utilisateur) {
        Produit produit = produitService.findById(req.produitId());

        List<Lot> lots = lotRepository
                .findByProduitIdAndActifTrueOrderByDatePeremptionAsc(req.produitId());

        int reste = req.quantite();

        for (Lot lot : lots) {
            if (reste <= 0) break;

            int disponible = lot.getQuantiteRestante();
            if (disponible <= 0) continue;

            int consomme = Math.min(disponible, reste);
            lot.setQuantiteRestante(disponible - consomme);
            reste -= consomme;

            if (lot.getQuantiteRestante() == 0) {
                lot.setActif(false);
            }
            lotRepository.save(lot);

            // Un mouvement par lot pour traçabilité complète
            Mouvement mouvement = Mouvement.builder()
                    .dateMouvement(LocalDateTime.now())
                    .quantite(consomme)
                    .type(TypeMouvement.SORTIE)
                    .motif(req.motif())
                    .produit(produit)
                    .lot(lot)
                    .utilisateur(utilisateur)
                    .build();
            mouvementRepository.save(mouvement);
        }

        if (reste > 0) {
            throw new IllegalStateException(
                    "Stock insuffisant pour le produit : " + produit.getNom() +
                    ". Manque : " + reste + " " + produit.getUnite());
        }
    }

    public List<MouvementResponse> getHistorique(Long produitId) {
        return mouvementRepository.findByProduitIdOrderByDateMouvementDesc(produitId)
                .stream().map(this::toMouvementResponse).toList();
    }

    public List<MouvementResponse> getHistoriqueComplet() {
        return mouvementRepository.findAll().stream()
                .sorted((a, b) -> b.getDateMouvement().compareTo(a.getDateMouvement()))
                .map(this::toMouvementResponse).toList();
    }

    public AlerteResponse getAlertes() {
        return new AlerteResponse(
                produitService.findEnAlerte(),
                lotService.getLotsPerimantBientot()
        );
    }

    public Integer getStockTotal(Long produitId) {
        Integer stock = lotRepository.getStockTotalByProduit(produitId);
        return stock != null ? stock : 0;
    }

    private MouvementResponse toMouvementResponse(Mouvement m) {
        String utilisateurNom = m.getUtilisateur() != null
                ? m.getUtilisateur().getPrenom() + " " + m.getUtilisateur().getNom()
                : "Système";
        return new MouvementResponse(
                m.getId(), m.getDateMouvement(), m.getQuantite(), m.getType(),
                m.getMotif(), m.getProduit().getId(), m.getProduit().getNom(),
                m.getLot().getId(), m.getLot().getNumeroLot(), utilisateurNom
        );
    }
}
