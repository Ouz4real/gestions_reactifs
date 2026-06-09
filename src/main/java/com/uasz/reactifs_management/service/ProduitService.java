package com.uasz.reactifs_management.service;

import com.uasz.reactifs_management.dto.ProduitRequest;
import com.uasz.reactifs_management.dto.ProduitResponse;
import com.uasz.reactifs_management.entity.Produit;
import com.uasz.reactifs_management.repository.LotRepository;
import com.uasz.reactifs_management.repository.ProduitRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProduitService {

    private final ProduitRepository produitRepository;
    private final LotRepository lotRepository;

    @Transactional
    public ProduitResponse create(ProduitRequest req) {
        Produit produit = Produit.builder()
                .nom(req.nom())
                .categorie(req.categorie())
                .type(req.type())
                .unite(req.unite())
                .temperatureConservation(req.temperatureConservation())
                .description(req.description())
                .fournisseur(req.fournisseur())
                .seuilAlerte(req.seuilAlerte() != null ? req.seuilAlerte() : 10)
                .build();
        return toResponse(produitRepository.save(produit));
    }

    @Transactional
    public ProduitResponse update(Long id, ProduitRequest req) {
        Produit produit = findById(id);
        produit.setNom(req.nom());
        produit.setCategorie(req.categorie());
        produit.setType(req.type());
        produit.setUnite(req.unite());
        produit.setTemperatureConservation(req.temperatureConservation());
        produit.setDescription(req.description());
        produit.setFournisseur(req.fournisseur());
        if (req.seuilAlerte() != null) produit.setSeuilAlerte(req.seuilAlerte());
        return toResponse(produitRepository.save(produit));
    }

    @Transactional
    public void delete(Long id) {
        produitRepository.deleteById(id);
    }

    public List<ProduitResponse> findAll() {
        return produitRepository.findAll().stream().map(this::toResponse).toList();
    }

    public ProduitResponse findOne(Long id) {
        return toResponse(findById(id));
    }

    public List<ProduitResponse> findEnAlerte() {
        return produitRepository.findProduitsEnAlerte().stream().map(this::toResponse).toList();
    }

    // --- helpers ---

    public Produit findById(Long id) {
        return produitRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produit introuvable : " + id));
    }

    public ProduitResponse toResponse(Produit p) {
        Integer stock = lotRepository.getStockTotalByProduit(p.getId());
        if (stock == null) stock = 0;
        return new ProduitResponse(
                p.getId(), p.getNom(), p.getCategorie(), p.getType(),
                p.getUnite(), p.getTemperatureConservation(), p.getDescription(),
                p.getFournisseur(), p.getSeuilAlerte(), stock, stock <= p.getSeuilAlerte()
        );
    }
}
