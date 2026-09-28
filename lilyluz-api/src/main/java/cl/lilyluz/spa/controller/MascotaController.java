package cl.lilyluz.spa.controller;

import cl.lilyluz.spa.model.Mascota;
import cl.lilyluz.spa.model.Tutor;
import cl.lilyluz.spa.repository.MascotaRepository;
import cl.lilyluz.spa.repository.TutorRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/mascotas")
@CrossOrigin(origins = "*")
public class MascotaController {

    private final MascotaRepository repo;
    private final TutorRepository tutorRepo;

    public MascotaController(MascotaRepository repo, TutorRepository tutorRepo) { 
        this.repo = repo; 
        this.tutorRepo = tutorRepo;
    }

    @GetMapping
    public List<Mascota> listar() { 
        return repo.findAll(); 
    }

    @PostMapping
    public ResponseEntity<Mascota> guardar(@RequestBody Mascota m) {
        if (m.getTutor() != null) {
            if (m.getTutor().getId() == null) {
                Tutor savedTutor = tutorRepo.save(m.getTutor());
                m.setTutor(savedTutor);
            } else {
                tutorRepo.findById(m.getTutor().getId()).ifPresent(t -> {
                    if (m.getTutor().getNombre() != null) t.setNombre(m.getTutor().getNombre());
                    if (m.getTutor().getTelefono() != null) t.setTelefono(m.getTutor().getTelefono());
                    tutorRepo.save(t);
                    m.setTutor(t);
                });
            }
        }
        Mascota guardada = repo.save(m);
        return ResponseEntity.ok(guardada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mascota> editar(@PathVariable Long id, @RequestBody Mascota req) {
        return repo.findById(id).map(m -> {
            m.setNombre(req.getNombre());
            m.setRaza(req.getRaza());
            m.setEdad(req.getEdad());
            m.setPeso(req.getPeso());
            m.setTamano(req.getTamano());
            m.setTagsComportamiento(req.getTagsComportamiento());
            m.setComentarios(req.getComentarios());

            if (req.getTutor() != null && m.getTutor() != null) {
                Tutor t = m.getTutor();
                if (req.getTutor().getNombre() != null) t.setNombre(req.getTutor().getNombre());
                if (req.getTutor().getTelefono() != null) t.setTelefono(req.getTutor().getTelefono());
                tutorRepo.save(t);
            } else if (req.getTutor() != null && m.getTutor() == null) {
                Tutor nuevo = tutorRepo.save(req.getTutor());
                m.setTutor(nuevo);
            }

            return ResponseEntity.ok(repo.save(m));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
