package cl.lilyluz.spa.repository;
import cl.lilyluz.spa.model.Finanza;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FinanzaRepository extends JpaRepository<Finanza, Long> {
    List<Finanza> findAllByOrderByIdDesc();
}
