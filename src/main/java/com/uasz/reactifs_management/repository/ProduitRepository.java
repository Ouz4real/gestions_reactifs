package com.uasz.reactifs_management.repository;

import com.uasz.reactifs_management.entity.CategorieProduit;
import com.uasz.reactifs_management.entity.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProduitRepository extends JpaRepository<Produit, Long> {

    List<Produit> findByCategorie(CategorieProduit categorie);

    // Produits dont le stock total est <= seuilAlerte
    @Query("""
        SELECT p FROM Produit p
        WHERE (SELECT COALESCE(SUM(l.quantiteRestante), 0) FROM Lot l WHERE l.produit = p AND l.actif = true)
              <= p.seuilAlerte
    """)
    List<Produit> findProduitsEnAlerte();
}
