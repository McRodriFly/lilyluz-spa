package cl.lilyluz.spa.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "mascotas")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Mascota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String raza;
    private Integer edad;
    private Double peso;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tutor_id", nullable = false)
    private Tutor tutor;

    @ElementCollection
    @CollectionTable(name = "mascota_tags", joinColumns = @JoinColumn(name = "mascota_id"))
    @Column(name = "tag")
    private List<String> tagsComportamiento;
}