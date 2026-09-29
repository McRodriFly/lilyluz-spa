package cl.lilyluz.spa.controller;

import cl.lilyluz.spa.model.Mascota;
import cl.lilyluz.spa.model.Tutor;
import cl.lilyluz.spa.repository.MascotaRepository;
import cl.lilyluz.spa.repository.TutorRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mascotas")
@CrossOrigin(origins = "*")
public class MascotaController {

    private final MascotaRepository repo;
    private final TutorRepository tutorRepo;
    private final Path uploadDir = Paths.get("data", "uploads");

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
            if (req.getFotoUrl() != null) {
                m.setFotoUrl(req.getFotoUrl());
            }

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
        try {
            Path filePath = uploadDir.resolve("mascota_" + id + ".jpg");
            Files.deleteIfExists(filePath);
        } catch (Exception ignored) {}
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/foto")
    public ResponseEntity<?> subirFoto(
            @PathVariable Long id,
            @RequestParam(value = "foto", required = false) MultipartFile file,
            @RequestBody(required = false) Map<String, String> body) {

        return repo.findById(id).map(m -> {
            try {
                if (!Files.exists(uploadDir)) {
                    Files.createDirectories(uploadDir);
                }

                Path filePath = uploadDir.resolve("mascota_" + id + ".jpg");

                if (file != null && !file.isEmpty()) {
                    file.transferTo(filePath.toFile());
                } else if (body != null && body.containsKey("dataUrl")) {
                    String dataUrl = body.get("dataUrl");
                    String base64 = dataUrl.contains(",") ? dataUrl.split(",")[1] : dataUrl;
                    byte[] bytes = Base64.getDecoder().decode(base64);
                    Files.write(filePath, bytes);
                } else {
                    return ResponseEntity.badRequest().body("No se proporcionó imagen");
                }

                String url = "/api/mascotas/" + id + "/foto?t=" + System.currentTimeMillis();
                m.setFotoUrl(url);
                repo.save(m);

                Map<String, Object> resp = new HashMap<>();
                resp.put("success", true);
                resp.put("fotoUrl", url);
                return ResponseEntity.ok(resp);
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body("Error guardando imagen: " + e.getMessage());
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> obtenerFoto(@PathVariable Long id) {
        Path filePath = uploadDir.resolve("mascota_" + id + ".jpg");
        if (Files.exists(filePath)) {
            try {
                byte[] bytes = Files.readAllBytes(filePath);
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .header("Cache-Control", "no-cache, no-store, must-revalidate")
                        .body(bytes);
            } catch (IOException ignored) {}
        }
        return ResponseEntity.notFound().build();
    }
}
