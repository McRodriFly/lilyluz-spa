package cl.lilyluz.spa.controller;

import cl.lilyluz.spa.model.EstadoVisita;
import cl.lilyluz.spa.model.Visita;
import cl.lilyluz.spa.model.Mascota;
import cl.lilyluz.spa.repository.MascotaRepository;
import cl.lilyluz.spa.repository.VisitaRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/visitas")
@CrossOrigin(origins = "*") 
public class VisitaController {

    private final VisitaRepository visitaRepository;
    private final MascotaRepository mascotaRepository;

    public VisitaController(VisitaRepository visitaRepository, MascotaRepository mascotaRepository) { 
        this.visitaRepository = visitaRepository; 
        this.mascotaRepository = mascotaRepository;
    }

    @GetMapping
    public List<Visita> obtenerTodas() {
        return visitaRepository.findAll();
    }

    @GetMapping("/hoy")
    public List<Visita> obtenerVisitasDeHoy(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return visitaRepository.findByFechaOrderByHoraAsc((fecha != null) ? fecha : LocalDate.now());
    }

    @PostMapping
    public ResponseEntity<Visita> agendarVisita(@RequestBody Map<String, Object> body) {
        Long mascotaId = Long.valueOf(body.get("mascotaId").toString());
        Mascota mascota = mascotaRepository.findById(mascotaId).orElseThrow();
        
        Visita visita = new Visita();
        visita.setMascota(mascota);
        visita.setFecha(LocalDate.parse(body.get("fecha").toString()));
        visita.setHora(LocalTime.parse(body.get("hora").toString()));
        visita.setEstado(EstadoVisita.PROGRAMADA);
        
        if (body.containsKey("servicios") && body.get("servicios") != null) {
            visita.setServicios(body.get("servicios").toString());
        }
        
        return ResponseEntity.ok(visitaRepository.save(visita));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Visita> actualizarVisita(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return visitaRepository.findById(id).map(visita -> {
            if (body.containsKey("fecha") && body.get("fecha") != null) {
                visita.setFecha(LocalDate.parse(body.get("fecha").toString()));
            }
            if (body.containsKey("hora") && body.get("hora") != null) {
                visita.setHora(LocalTime.parse(body.get("hora").toString()));
            }
            if (body.containsKey("estado") && body.get("estado") != null) {
                try {
                    visita.setEstado(EstadoVisita.valueOf(body.get("estado").toString()));
                } catch (Exception ignored) {}
            }
            if (body.containsKey("montoRecaudado") && body.get("montoRecaudado") != null) {
                try {
                    visita.setMontoRecaudado(Double.parseDouble(body.get("montoRecaudado").toString()));
                } catch (Exception ignored) {}
            }
            if (body.containsKey("detalleVisita") && body.get("detalleVisita") != null) {
                visita.setDetalleVisita(body.get("detalleVisita").toString());
            }
            return ResponseEntity.ok(visitaRepository.save(visita));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarVisita(@PathVariable Long id) {
        visitaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/{accion}")
    public ResponseEntity<Visita> cambiarEstado(@PathVariable Long id, @PathVariable String accion) {
        return visitaRepository.findById(id).map(visita -> {
            if ("iniciar".equals(accion)) {
                visita.setEstado(EstadoVisita.EN_PROCESO);
                visita.setHoraLlegada(LocalDateTime.now());
            } else if ("terminar".equals(accion)) {
                visita.setEstado(EstadoVisita.LISTO);
                visita.setHoraListo(LocalDateTime.now());
            } else if ("reabrir".equals(accion)) {
                visita.setEstado(EstadoVisita.PROGRAMADA);
            }
            return ResponseEntity.ok(visitaRepository.save(visita));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/detalles")
    public ResponseEntity<Visita> actualizarDetalles(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return visitaRepository.findById(id).map(visita -> {
            if (body.containsKey("detalleVisita") && body.get("detalleVisita") != null) {
                visita.setDetalleVisita(body.get("detalleVisita").toString());
            }
            if (body.containsKey("notas") && body.get("notas") != null) {
                visita.setNotas(body.get("notas").toString());
            }
            return ResponseEntity.ok(visitaRepository.save(visita));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/pagar")
    public ResponseEntity<Visita> registrarPago(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return visitaRepository.findById(id).map(visita -> {
            visita.setEstado(EstadoVisita.FINALIZADA);
            if (body.get("montoRecaudado") != null && !body.get("montoRecaudado").toString().trim().isEmpty()) {
                visita.setMontoRecaudado(Double.parseDouble(body.get("montoRecaudado").toString().trim()));
            }
            if (body.get("metodoPago") != null) {
                visita.setMetodoPago(body.get("metodoPago").toString());
            }
            if (body.get("comprobantePago") != null) {
                visita.setComprobantePago(body.get("comprobantePago").toString());
            }
            return ResponseEntity.ok(visitaRepository.save(visita));
        }).orElse(ResponseEntity.notFound().build());
    }
}
