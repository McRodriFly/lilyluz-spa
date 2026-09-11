package cl.lilyluz.spa.controller;

import cl.lilyluz.spa.model.Mascota;
import cl.lilyluz.spa.repository.MascotaRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/mascotas")
@CrossOrigin(origins = "*")
public class MascotaController {

    private final MascotaRepository mascotaRepository;

    public MascotaController(MascotaRepository mascotaRepository) {
        this.mascotaRepository = mascotaRepository;
    }

    @GetMapping
    public List<Mascota> listarMascotas() {
        return mascotaRepository.findAll();
    }

    @PostMapping
    public Mascota crearMascota(@RequestBody Mascota mascota) {
        return mascotaRepository.save(mascota);
    }
}