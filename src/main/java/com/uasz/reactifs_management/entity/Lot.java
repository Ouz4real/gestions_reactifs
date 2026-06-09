package com.uasz.reactifs_management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String numeroLot;

    private LocalDate dateFabrication;

    @NotNull
    @Column(nullable = false)
    private LocalDate datePeremption;

    @NotNull
    @Column(nullable = false)
    private LocalDate dateAcquisition;

    @NotNull
    @Column(nullable = false)
    private Integer quantiteInitiale;

    @Column(nullable = false)
    private Integer quantiteRestante;

    // true si le lot est épuisé ou périmé
    @Builder.Default
    private boolean actif = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Produit produit;

    // Mouvements liés à ce lot pour traçabilité complète
    @OneToMany(mappedBy = "lot", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Mouvement> mouvements = new ArrayList<>();
}
