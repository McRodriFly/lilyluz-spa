package cl.lilyluz.spa.controller;

import cl.lilyluz.spa.model.EstadoVisita;
import cl.lilyluz.spa.model.Visita;
import cl.lilyluz.spa.repository.VisitaRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/visitas")
@CrossOrigin(origins = "*") 
public class VisitaController {

    private final VisitaRepository visitaRepository;

    public VisitaController(VisitaRepository visitaRepository) {
        this.visitaRepository = visitaRepository;
    }

    @GetMapping("/hoy")
    public List<Visita> obtenerVisitasDeHoy(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        LocalDate consultaFecha = (fecha != null) ? fecha : LocalDate.now();
        return visitaRepository.findByFechaOrderByHoraAsc(consultaFecha);
    }

    @PatchMapping("/{id}/iniciar")
    public ResponseEntity<Visita> iniciarVisita(@PathVariable Long id) {
        return visitaRepository.findById(id).map(visita -> {
            visita.setEstado(EstadoVisita.EN_PROCESO);
            visita.setHoraLlegada(LocalDateTime.now());
            return ResponseEntity.ok(visitaRepository.save(visita));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/terminar")
    public ResponseEntity<Visita> terminarVisita(@PathVariable Long id) {
        return visitaRepository.findById(id).map(visita -> {
            visita.setEstado(EstadoVisita.LISTO);
            visita.setHoraListo(LocalDateTime.now());
            return ResponseEntity.ok(visitaRepository.save(visita));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Visita agendarVisita(@RequestBody Visita visita) {
        return visitaRepository.save(visita);
    }
}