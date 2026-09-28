package cl.lilyluz.spa.repository;
import cl.lilyluz.spa.model.Visita;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface VisitaRepository extends JpaRepository<Visita, Long> {
    List<Visita> findByFechaOrderByHoraAsc(LocalDate fecha);
    List<Visita> findByMascota_Nombre(String nombre);
}
