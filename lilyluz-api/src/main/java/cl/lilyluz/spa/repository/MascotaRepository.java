package cl.lilyluz.spa.repository;

import cl.lilyluz.spa.model.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MascotaRepository extends JpaRepository<Mascota, Long> {
}