package com.uasz.reactifs_management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mouvements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mouvement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime dateMouvement;

    @NotNull
    @Column(nullable = false)
    private Integer quantite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeMouvement type;

    private String motif; // ex: "Analyse NFS", "Périmé", "Réception commande"

    // Produit concerné (dénormalisé pour requêtes rapides)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Produit produit;

    // Lot précis concerné — essentiel pour la traçabilité FIFO
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lot_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Lot lot;

    // Utilisateur qui a effectué le mouvement
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Utilisateur utilisateur;
}
