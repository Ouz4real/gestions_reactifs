package com.uasz.reactifs_management.service;

import com.uasz.reactifs_management.dto.LotRequest;
import com.uasz.reactifs_management.dto.LotResponse;
import com.uasz.reactifs_management.entity.Lot;
import com.uasz.reactifs_management.entity.Mouvement;
import com.uasz.reactifs_management.entity.TypeMouvement;
import com.uasz.reactifs_management.entity.Utilisateur;
import com.uasz.reactifs_management.repository.LotRepository;
import com.uasz.reactifs_management.repository.MouvementRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LotService {

    private final LotRepository lotRepository;
    private final MouvementRepository mouvementRepository;
    private final ProduitService produitService;

    private static final int JOURS_ALERTE_PEREMPTION = 60;

    @Transactional
    public LotResponse create(LotRequest req, Utilisateur utilisateur) {
        var produit = produitService.findById(req.produitId());

        Lot lot = Lot.builder()
                .numeroLot(req.numeroLot())
                .dateFabrication(req.dateFabrication())
                .datePeremption(req.datePeremption())
                .dateAcquisition(req.dateAcquisition())
                .quantiteInitiale(req.quantiteInitiale())
                .quantiteRestante(req.quantiteInitiale())
                .produit(produit)
                .build();

        lot = lotRepository.save(lot);

        // Enregistrer le mouvement d'entrée
        Mouvement mouvement = Mouvement.builder()
                .dateMouvement(LocalDateTime.now())
                .quantite(req.quantiteInitiale())
                .type(TypeMouvement.ENTREE)
                .motif(req.motif() != null ? req.motif() : "Réception lot " + req.numeroLot())
                .produit(produit)
                .lot(lot)
                .utilisateur(utilisateur)
                .build();
        mouvementRepository.save(mouvement);

        return toResponse(lot);
    }

    public List<LotResponse> getByProduit(Long produitId) {
        return lotRepository.findByProduitIdAndActifTrueOrderByDatePeremptionAsc(produitId)
                .stream().map(this::toResponse).toList();
    }

    public List<LotResponse> getLotsPerimantBientot() {
        LocalDate limite = LocalDate.now().plusDays(JOURS_ALERTE_PEREMPTION);
        return lotRepository.findLotsPerimantAvant(limite)
                .stream().map(this::toResponse).toList();
    }

    public Lot findById(Long id) {
        return lotRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lot introuvable : " + id));
    }

    public LotResponse toResponse(Lot l) {
        boolean proche = l.getDatePeremption()
                .isBefore(LocalDate.now().plusDays(JOURS_ALERTE_PEREMPTION));
        return new LotResponse(
                l.getId(), l.getNumeroLot(), l.getDateFabrication(),
                l.getDatePeremption(), l.getDateAcquisition(),
                l.getQuantiteInitiale(), l.getQuantiteRestante(), l.isActif(),
                l.getProduit().getId(), l.getProduit().getNom(), proche
        );
    }
}
