package cl.lilyluz.spa.controller;

import cl.lilyluz.spa.model.Producto;
import cl.lilyluz.spa.repository.ProductoRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {
    
    private final ProductoRepository repo;
    
    public ProductoController(ProductoRepository repo) { 
        this.repo = repo; 
    }

    @GetMapping
    public List<Producto> listar() { 
        return repo.findAll(); 
    }

    @PostMapping
    public Producto crear(@RequestBody Producto prod) { 
        return repo.save(prod); 
    }

    @PatchMapping("/{id}/gastar")
    public ResponseEntity<Producto> gastar(@PathVariable Long id, @RequestBody Map<String, Double> payload) {
        return repo.findById(id).map(p -> {
            p.setCantidadDisponible(p.getCantidadDisponible() - payload.get("cantidad"));
            return ResponseEntity.ok(repo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
