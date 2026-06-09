package com.uasz.reactifs_management.config;

import com.uasz.reactifs_management.entity.Role;
import com.uasz.reactifs_management.entity.Utilisateur;
import com.uasz.reactifs_management.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!utilisateurRepository.existsByEmail("admin@uasz.sn")) {
            Utilisateur admin = Utilisateur.builder()
                    .nom("Admin")
                    .prenom("Système")
                    .email("admin@uasz.sn")
                    .motDePasse(passwordEncoder.encode("Admin@1234"))
                    .role(Role.ROLE_ADMIN)
                    .build();
            utilisateurRepository.save(admin);
            log.info("Compte admin créé : admin@uasz.sn / Admin@1234");
        }
    }
}
