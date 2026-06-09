package com.uasz.reactifs_management.service;

import com.uasz.reactifs_management.dto.ConsommationRequest;
import com.uasz.reactifs_management.dto.DemandeRequest;
import com.uasz.reactifs_management.dto.DemandeResponse;
import com.uasz.reactifs_management.entity.Demande;
import com.uasz.reactifs_management.entity.Produit;
import com.uasz.reactifs_management.entity.Role;
import com.uasz.reactifs_management.entity.StatutDemande;
import com.uasz.reactifs_management.entity.Utilisateur;
import com.uasz.reactifs_management.repository.DemandeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DemandeService {

    private final DemandeRepository demandeRepository;
    private final ProduitService produitService;
    private final StockService stockService;

    @Transactional
    public DemandeResponse creer(DemandeRequest req, Utilisateur demandeur) {
        if (demandeur.getRole() != Role.ROLE_TECHNICIEN && demandeur.getRole() != Role.ROLE_ADMIN) {
            throw new IllegalStateException("Seuls les techniciens et l'admin peuvent créer une demande.");
        }
        Produit produit = produitService.findById(req.produitId());
        Demande demande = Demande.builder()
                .produit(produit)
                .quantiteDemandee(req.quantiteDemandee())
                .motif(req.motif())
                .demandeur(demandeur)
                .dateCreation(LocalDateTime.now())
                .build();
        return toResponse(demandeRepository.save(demande));
    }

    @Transactional
    public DemandeResponse valider(Long id, boolean approuver,
                                   String commentaire, Utilisateur valideur) {
        if (valideur.getRole() != Role.ROLE_MAJOR && valideur.getRole() != Role.ROLE_ADMIN) {
            throw new IllegalStateException("Seuls les majors et admins peuvent valider une demande.");
        }
        Demande demande = findById(id);

        if (demande.getStatut() != StatutDemande.EN_ATTENTE) {
            throw new IllegalStateException("Cette demande a déjà été traitée.");
        }

        demande.setValideur(valideur);
        demande.setDateValidation(LocalDateTime.now());
        demande.setCommentaireValidation(commentaire);
        demande.setStatut(approuver ? StatutDemande.VALIDEE : StatutDemande.REJETEE);

        return toResponse(demandeRepository.save(demande));
    }

    /**
     * Le magasinier distribue le stock — déclenche la consommation FIFO
     */
    @Transactional
    public DemandeResponse traiter(Long id, Utilisateur magasinier) {
        if (magasinier.getRole() != Role.ROLE_MAGASINIER && magasinier.getRole() != Role.ROLE_ADMIN) {
            throw new IllegalStateException("Seuls les magasiniers et admins peuvent traiter une demande.");
        }
        Demande demande = findById(id);

        if (demande.getStatut() != StatutDemande.VALIDEE) {
            throw new IllegalStateException("La demande doit être validée avant traitement.");
        }

        stockService.consommer(
                new ConsommationRequest(
                        demande.getProduit().getId(),
                        demande.getQuantiteDemandee(),
                        "Distribution demande #" + demande.getId()
                ),
                magasinier
        );

        demande.setStatut(StatutDemande.TRAITEE);
        return toResponse(demandeRepository.save(demande));
    }

    public List<DemandeResponse> getMesDemandes(Long demandeurId) {
        return demandeRepository.findByDemandeurIdOrderByDateCreationDesc(demandeurId)
                .stream().map(this::toResponse).toList();
    }

    public List<DemandeResponse> getDemandesEnAttente() {
        return demandeRepository.findByStatutOrderByDateCreationDesc(StatutDemande.EN_ATTENTE)
                .stream().map(this::toResponse).toList();
    }

    public List<DemandeResponse> getDemandesValidees() {
        return demandeRepository.findByStatutOrderByDateCreationDesc(StatutDemande.VALIDEE)
                .stream().map(this::toResponse).toList();
    }

    private Demande findById(Long id) {
        return demandeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Demande introuvable : " + id));
    }

    private DemandeResponse toResponse(Demande d) {
        String valideurNom = d.getValideur() != null
                ? d.getValideur().getPrenom() + " " + d.getValideur().getNom() : null;
        return new DemandeResponse(
                d.getId(), d.getProduit().getId(), d.getProduit().getNom(),
                d.getQuantiteDemandee(), d.getMotif(), d.getStatut(),
                d.getDemandeur().getPrenom() + " " + d.getDemandeur().getNom(),
                valideurNom, d.getDateCreation(), d.getDateValidation(),
                d.getCommentaireValidation()
        );
    }
}
