package cl.lilyluz.spa.repository;
import cl.lilyluz.spa.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProductoRepository extends JpaRepository<Producto, Long> {}
