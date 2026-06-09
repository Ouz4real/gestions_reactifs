package com.uasz.reactifs_management.repository;

import com.uasz.reactifs_management.entity.Lot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LotRepository extends JpaRepository<Lot, Long> {

    // FIFO : lots actifs triés par date de péremption croissante
    List<Lot> findByProduitIdAndActifTrueOrderByDatePeremptionAsc(Long produitId);

    // Lots périmant dans les prochains jours (alerte péremption)
    @Query("""
        SELECT l FROM Lot l
        WHERE l.actif = true
          AND l.quantiteRestante > 0
          AND l.datePeremption <= :dateLimite
        ORDER BY l.datePeremption ASC
    """)
    List<Lot> findLotsPerimantAvant(@Param("dateLimite") LocalDate dateLimite);

    // Stock total disponible pour un produit
    @Query("""
        SELECT COALESCE(SUM(l.quantiteRestante), 0) FROM Lot l
        WHERE l.produit.id = :produitId AND l.actif = true
    """)
    Integer getStockTotalByProduit(@Param("produitId") Long produitId);
}
