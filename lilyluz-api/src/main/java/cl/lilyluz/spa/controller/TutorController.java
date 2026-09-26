package cl.lilyluz.spa.controller;

import cl.lilyluz.spa.model.Tutor;
import cl.lilyluz.spa.repository.TutorRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tutores")
@CrossOrigin(origins = "*")
public class TutorController {

    private final TutorRepository tutorRepository;

    public TutorController(TutorRepository tutorRepository) {
        this.tutorRepository = tutorRepository;
    }

    @GetMapping
    public List<Tutor> listarTutores() {
        return tutorRepository.findAll();
    }

    @PostMapping
    public Tutor crearTutor(@RequestBody Tutor tutor) {
        return tutorRepository.save(tutor);
    }
}