package com.gestock.controller;

import com.gestock.model.Venta;
import com.gestock.service.VentaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/venta")
@CrossOrigin(origins = "*")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    @PostMapping
    public ResponseEntity<?> registrarVenta(@Valid @RequestBody Venta venta) {
        try {
            Venta nueva = ventaService.registrarVenta(venta);
            return ResponseEntity.ok(nueva);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().body("Error al procesar la venta: " + e.getMessage());
        }
    }
}
