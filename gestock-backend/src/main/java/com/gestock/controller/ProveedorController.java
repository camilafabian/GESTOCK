package com.gestock.controller;

import com.gestock.dto.ArticuloProveedorDTO;
import com.gestock.model.Articulo;
import com.gestock.model.ArticuloProveedor;
import com.gestock.model.Proveedor;
import com.gestock.repository.ProveedorRepository;
import com.gestock.service.ProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/proveedor")
@CrossOrigin(origins = "*")
public class ProveedorController {

    @Autowired
    private ProveedorRepository proveedorRepository;
    @Autowired
    private ProveedorService proveedorService;

    @GetMapping
    public List<Proveedor> getProveedor() {
        return proveedorService.listarProveedores();
    }

    /**
     * Crea un proveedor con artículos asociados
     */
    @PostMapping("/con-articulos")
    public ResponseEntity<?> crearProveedorConArticulos(
            @RequestBody Map<String, Object> request) {
        try {
            // Extraer el proveedor y la lista de artículos del request
            if (!request.containsKey("proveedor") || !request.containsKey("articulos")) {
                return ResponseEntity.badRequest().body("El request debe contener 'proveedor' y 'articulos'");
            }

            // Convertir el objeto proveedor
            Proveedor proveedor = new Proveedor();
            Map<String, Object> proveedorMap = (Map<String, Object>) request.get("proveedor");

            proveedor.setNombreProveedor((String) proveedorMap.get("nombreProveedor"));
            proveedor.setDireccionProveedor((String) proveedorMap.get("direccionProveedor"));
            proveedor.setTelefonoProveedor(Long.valueOf(proveedorMap.get("telefonoProveedor").toString()));
            proveedor.setEmailProveedor((String) proveedorMap.get("emailProveedor"));

            // Convertir la lista de artículos
            List<Map<String, Object>> articulosMapList = (List<Map<String, Object>>) request.get("articulos");
            List<ArticuloProveedorDTO> articulosDTO = articulosMapList.stream()
                    .map(artMap -> {
                        ArticuloProveedorDTO dto = new ArticuloProveedorDTO();
                        dto.setCodigoArticulo(Long.valueOf(artMap.get("codigoArticulo").toString()));
                        dto.setDemoraEntrega(Double.valueOf(artMap.get("demoraEntrega").toString()));
                        dto.setPrecioUnitario(Double.valueOf(artMap.get("precioUnitario").toString()));
                        dto.setCargoPedido(Double.valueOf(artMap.get("cargoPedido").toString()));
                        return dto;
                    })
                    .toList();

            Proveedor provcreado = proveedorService.crearProveedorConArticulos(proveedor, articulosDTO);
            return ResponseEntity.ok(provcreado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al procesar la solicitud: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarProveedor(@PathVariable Long id, @RequestBody Proveedor proveedorActualizado) {
        try {
            return proveedorService.actualizarProveedor(id, proveedorActualizado)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalStateException error) {
            return ResponseEntity.badRequest().body(error.getMessage());
        }
    }

    // ... existing code ...
    @PutMapping("/baja/{id}")
    public ResponseEntity<String> bajarProveedor(@PathVariable Long id) {
        try {
            proveedorService.bajarProveedor(id);
            return ResponseEntity.ok("Proveedor dado de baja correctamente.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al dar de baja el proveedor: " + e.getMessage());
        }
    }
// ... existing code ...

    @GetMapping("/articulos/{id}")
    public List<Articulo> listarPorProveedor(@PathVariable Long id) {
        return proveedorService.listarArticulosPorProveedor(id);
    }

    @GetMapping("/{id}/articulos-proveedor")
    public List<ArticuloProveedor> listarArticulosProveedor(@PathVariable Long id) {
        return proveedorService.listarArticulosProveedor(id);
    }

    /**
     * Agrega artículos a un proveedor existente
     */
    @PostMapping("/{id}/articulos")
    public ResponseEntity<?> agregarArticulosAProveedor(
            @PathVariable Long id,
            @RequestBody List<ArticuloProveedorDTO> articulosDTO) {
        try {
            List<ArticuloProveedor> relaciones = proveedorService.agregarArticulosAProveedor(id, articulosDTO);
            return ResponseEntity.ok(relaciones);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
