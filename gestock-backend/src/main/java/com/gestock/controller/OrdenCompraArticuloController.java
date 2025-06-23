package com.gestock.controller;

import com.gestock.model.OrdenCompraArticulo;
import com.gestock.model.EstadoOrdenCompra;
import com.gestock.repository.OrdenCompraArticuloRepository;
import com.gestock.service.OrdenCompraArticuloService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@RestController
@RequestMapping("/api/ordenCompraArticulo")
@CrossOrigin(origins = "*")
public class OrdenCompraArticuloController {

    @Autowired
    private OrdenCompraArticuloRepository ordenCompraArticuloRepository;
    @Autowired
    private OrdenCompraArticuloService ordenCompraArticuloService;

    @GetMapping
    public List<OrdenCompraArticulo> getOrdenCompraArticulo() {
        return ordenCompraArticuloRepository.findAll();
    }

    @GetMapping("/tieneOCActiva/{codigoArticulo}")
    public ResponseEntity<Boolean> verificarSiTieneOCActiva(@PathVariable Long codigoArticulo) {
        boolean existe = ordenCompraArticuloService.tieneOCActiva(codigoArticulo);
        return ResponseEntity.ok(existe);
    }

    @PostMapping
    public OrdenCompraArticulo crearOrdenCompraArticulo(@RequestBody OrdenCompraArticulo o) {
        return ordenCompraArticuloRepository.save(o);
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarOrdenCompra(@PathVariable Long id, @RequestBody OrdenCompraArticulo datosActualizados) {
        Optional<OrdenCompraArticulo> OCAOptional = ordenCompraArticuloRepository.findById(id);

        if (OCAOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        OrdenCompraArticulo orden = OCAOptional.get();

        String estadoActual = orden.getEstado().getNombreEstado();
        if (!estadoActual.equalsIgnoreCase("Pendiente")) {
            return ResponseEntity.badRequest().body("Solo se puede modificar una Orden de Compra en estado 'Pendiente'");
        }

        orden.setCantidad(datosActualizados.getCantidad());
        orden.setArticuloProveedor(datosActualizados.getArticuloProveedor());
        orden.setEstado(datosActualizados.getEstado());

        ordenCompraArticuloRepository.save(orden);
        return ResponseEntity.ok(orden);
    }

    @PutMapping("/baja/{id}")
    public ResponseEntity<?> cancelarOrden(@PathVariable Long id) {
        try {
            String mensaje = ordenCompraArticuloService.cancelarOrdenCompra(id);
            return ResponseEntity.ok(mensaje);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crearNuevaOrdenCompra(
            @RequestParam Long codigoArticulo,
            @RequestParam Long codigoProveedor,
            @RequestParam Integer cantidad,
            @RequestParam boolean esAutomatica) {
        try {
            OrdenCompraArticulo nuevaOrden = ordenCompraArticuloService.crearOrdenCompra(
                    codigoArticulo, codigoProveedor, cantidad, esAutomatica);
            return ResponseEntity.ok(nuevaOrden);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/enviar/{id}")
    public ResponseEntity<?> enviarOrden(@PathVariable Long id) {
        try {
            String mensaje = ordenCompraArticuloService.enviarOrdenCompra(id);
            return ResponseEntity.ok(mensaje);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/finalizar/{id}")
    public ResponseEntity<?> finalizarOrden(@PathVariable Long id) {
        try {
            String mensaje = ordenCompraArticuloService.finalizarOrdenCompra(id);
            return ResponseEntity.ok(mensaje);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
