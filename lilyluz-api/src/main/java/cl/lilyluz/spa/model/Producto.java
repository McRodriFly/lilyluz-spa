package cl.lilyluz.spa.model;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private Double cantidadDisponible;
    private String unidadMedida; // ml, gr, un
    private Double gastoPromedioPorUso;
}
