package com.uasz.reactifs_management.repository;

import com.uasz.reactifs_management.entity.Mouvement;
import com.uasz.reactifs_management.entity.TypeMouvement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MouvementRepository extends JpaRepository<Mouvement, Long> {

    List<Mouvement> findByProduitIdOrderByDateMouvementDesc(Long produitId);

    List<Mouvement> findByType(TypeMouvement type);

    List<Mouvement> findByDateMouvementBetweenOrderByDateMouvementDesc(
            LocalDateTime debut, LocalDateTime fin);

    List<Mouvement> findByUtilisateurIdOrderByDateMouvementDesc(Long utilisateurId);

    @Query("SELECT COUNT(m) FROM Mouvement m WHERE m.dateMouvement >= :debut AND m.dateMouvement < :fin")
    long countByDateMouvementBetween(@Param("debut") LocalDateTime debut,
                                     @Param("fin") LocalDateTime fin);

    // Grouper par jour et type sur une période donnée
    @Query("""
        SELECT CAST(m.dateMouvement AS date), m.type, COUNT(m)
        FROM Mouvement m
        WHERE m.dateMouvement >= :depuis AND m.dateMouvement < :jusqua
        GROUP BY CAST(m.dateMouvement AS date), m.type
        ORDER BY CAST(m.dateMouvement AS date) ASC
    """)
    List<Object[]> countByDayAndType(@Param("depuis") LocalDateTime depuis,
                                     @Param("jusqua") LocalDateTime jusqua);
}
