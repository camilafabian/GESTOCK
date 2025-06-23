package com.gestock.controller;

import com.gestock.model.Articulo;
import com.gestock.model.Proveedor;
import com.gestock.service.ArticuloService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articulo")
@CrossOrigin(origins = "*")
public class ArticuloController {

    @Autowired
    private ArticuloService articuloService;

    @GetMapping
    public List<Articulo> getArticulos() {
        return articuloService.listarArticulos();
    }


    @PostMapping
    public ResponseEntity<?> crearArticulo(@RequestBody Articulo articulo) {
        try {
            System.out.println("Intentando crear artículo: " + articulo);
            Articulo creado = articuloService.crearArticulo(articulo);
            return ResponseEntity.ok(creado);
        } catch (IllegalStateException e) {
            System.err.println("Error de validación: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error de validación: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error al crear artículo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al crear el artículo: " + e.getMessage() + "\n" + e.getStackTrace()[0]);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarArticulo(@PathVariable Long id, @RequestBody Articulo articuloActualizado) {
        try {
            return articuloService.actualizarArticulo(id, articuloActualizado)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalStateException error) {
            return ResponseEntity.badRequest().body(error.getMessage());
        }
    }

    // Dar de baja lógica a un artículo
    @PutMapping("/baja/{id}")
    public ResponseEntity<String> darDeBaja(@PathVariable Long id) {
        boolean exito = articuloService.bajarArticulo(id);
        if (exito) {
            return ResponseEntity.ok("Artículo dado de baja correctamente.");
        } else {
            return ResponseEntity.badRequest().body("No se pudo dar de baja. Puede tener stock o una orden activa.");
        }
    }

    // Listar artículos a reponer
    @GetMapping("/a-reponer")
    public List<Articulo> listarAReponer() {
        return articuloService.listarAReponer();
    }

    // Listar artículos faltantes
    @GetMapping("/faltantes")
    public List<Articulo> listarFaltantes() {
        return articuloService.listarFaltantes();
    }

    // Listar proveedores activos por artículo
    @GetMapping("/{id}/proveedores")
    public List<Proveedor> listarProveedoresPorArticulo(@PathVariable Long id) {
        return articuloService.listarProveedoresDeArticulo(id);
    }
}

