package cl.lilyluz.spa.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "visitas")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Visita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mascota_id", nullable = false)
    private Mascota mascota;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private LocalTime hora;

    private LocalDateTime horaLlegada;
    private LocalDateTime horaListo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(50)")
    private EstadoVisita estado;

    private String notas;
    private String servicios;
    @Lob
    @Column(columnDefinition="LONGTEXT")
    private String detalleVisita;
    private String servicioAdicional;
    private Double montoFinalPactado;

    private String metodoPago;
    @Lob
    @Column(columnDefinition="LONGTEXT")
    private String comprobantePago;
    private Double montoRecaudado;

    @PrePersist
    public void prePersist() {
        if (this.estado == null) {
            this.estado = EstadoVisita.PROGRAMADA;
        }
    }
}
