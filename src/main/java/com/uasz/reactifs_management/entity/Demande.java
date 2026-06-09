package com.uasz.reactifs_management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "demandes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Demande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Produit produit;

    @NotNull
    @Column(nullable = false)
    private Integer quantiteDemandee;

    private String motif;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutDemande statut = StatutDemande.EN_ATTENTE;

    // Technicien qui fait la demande
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demandeur_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Utilisateur demandeur;

    // Major qui valide
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "valideur_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Utilisateur valideur;

    @Column(nullable = false)
    private LocalDateTime dateCreation;

    private LocalDateTime dateValidation;

    private String commentaireValidation;
}
