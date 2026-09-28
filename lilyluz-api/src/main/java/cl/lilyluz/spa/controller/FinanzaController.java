package cl.lilyluz.spa.controller;
import cl.lilyluz.spa.model.Finanza;
import cl.lilyluz.spa.repository.FinanzaRepository;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/finanzas")
@CrossOrigin(origins = "*")
public class FinanzaController {
    private final FinanzaRepository finanzaRepository;
    public FinanzaController(FinanzaRepository finanzaRepository) { this.finanzaRepository = finanzaRepository; }

    @GetMapping
    public List<Finanza> listar() { return finanzaRepository.findAllByOrderByIdDesc(); }

    @PostMapping
    public Finanza registrar(@RequestBody Finanza finanza) {
        if(finanza.getFecha() == null) finanza.setFecha(LocalDate.now());
        return finanzaRepository.save(finanza);
    }
}
