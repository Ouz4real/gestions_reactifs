package com.uasz.reactifs_management.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "produits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nom;

    // ex: REACTIF, CONSOMMABLE
    @Enumerated(EnumType.STRING)
    @NotNull
    private CategorieProduit categorie;

    private String type; // ex: glycémie, urée, NFS...

    private String unite; // ex: mL, unité, boîte

    private String temperatureConservation;

    private String description;

    private String fournisseur;

    // Seuil en dessous duquel une alerte est déclenchée
    @Column(nullable = false)
    @Builder.Default
    private Integer seuilAlerte = 10;

    @OneToMany(mappedBy = "produit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Lot> lots = new ArrayList<>();
}
