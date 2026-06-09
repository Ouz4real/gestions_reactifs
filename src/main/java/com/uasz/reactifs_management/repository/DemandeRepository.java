package com.uasz.reactifs_management.repository;

import com.uasz.reactifs_management.entity.Demande;
import com.uasz.reactifs_management.entity.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DemandeRepository extends JpaRepository<Demande, Long> {

    List<Demande> findByDemandeurIdOrderByDateCreationDesc(Long demandeurId);

    List<Demande> findByStatutOrderByDateCreationDesc(StatutDemande statut);
}
