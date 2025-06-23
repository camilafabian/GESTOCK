package com.gestock.service;

import com.gestock.dto.ArticuloProveedorDTO;
import com.gestock.model.Articulo;
import com.gestock.model.ArticuloProveedor;
import com.gestock.model.ArticuloProveedorId;
import com.gestock.model.Proveedor;
import com.gestock.repository.ArticuloProveedorRepository;
import com.gestock.repository.ArticuloRepository;
import com.gestock.repository.OrdenCompraArticuloRepository;
import com.gestock.repository.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProveedorService {

    @Autowired
    private ProveedorRepository proveedorRepository;

    @Autowired
    private ArticuloRepository articuloRepository;

    @Autowired
    private OrdenCompraArticuloRepository ordenCompraArticuloRepository;

    @Autowired
    private ArticuloProveedorRepository articuloProveedorRepository;


    public List<Proveedor> listarProveedores() {
        return proveedorRepository.findAll().stream()
                .filter(a -> a.getFechaHoraBajaProveedor() == null)
                .collect(Collectors.toList());
    }

    /**
     * Crea un proveedor con una lista de artículos asociados
     * @param proveedor El proveedor a crear
     * @param articulosDTO Lista de DTOs con la información de artículos a asociar
     * @return El proveedor creado
     */
    @Transactional
    public Proveedor crearProveedorConArticulos(Proveedor proveedor, List<ArticuloProveedorDTO> articulosDTO) {
        if (articulosDTO == null || articulosDTO.isEmpty()) {
            throw new IllegalArgumentException("Todo proveedor debe asociarse a un artículo como mínimo.");
        }

        // Guardar el proveedor primero
        Proveedor proveedorGuardado = proveedorRepository.save(proveedor);

        // Crear las relaciones artículo-proveedor
        List<ArticuloProveedor> relacionesCreadas = new ArrayList<>();

        for (ArticuloProveedorDTO dto : articulosDTO) {
            // Verificar que el artículo existe
            Articulo articulo = articuloRepository.findById(dto.getCodigoArticulo())
                    .orElseThrow(() -> new IllegalArgumentException("Artículo no encontrado con ID: " + dto.getCodigoArticulo()));

            // Crear la relación
            ArticuloProveedor ap = new ArticuloProveedor();
            ap.setArticulo(articulo);
            ap.setProveedor(proveedorGuardado);
            ap.setDemoraEntrega(dto.getDemoraEntrega());
            ap.setPrecioUnitario(dto.getPrecioUnitario());
            ap.setCargoPedido(dto.getCargoPedido());

            // Crear el ID compuesto
            ArticuloProveedorId id = new ArticuloProveedorId();
            id.setArticulo(articulo.getCodigoArticulo());
            id.setProveedor(proveedorGuardado.getCodigoProveedor());
            ap.setId(id);

            relacionesCreadas.add(articuloProveedorRepository.save(ap));
        }

        return proveedorGuardado;
    }
    
    public void bajarProveedor(Long id) {
        // Verificar si es proveedor predeterminado de algún artículo
        boolean esPredeterminado = articuloRepository
                .existsByProveedorPredeterminado_CodigoProveedorAndFechaHoraBajaArticuloIsNull(id);

        if (esPredeterminado) {
            throw new IllegalStateException("No se puede dar de baja un proveedor que es predeterminado de algún artículo.");
        }

        // Verificar si tiene OC activas a través de ArticuloProveedor
        List<ArticuloProveedor> relacionesProveedor = articuloProveedorRepository.findByProveedorCodigoProveedor(id);
        boolean tieneOCActiva = relacionesProveedor.stream()
                .anyMatch(ap -> ordenCompraArticuloRepository.existsByArticuloProveedor_ArticuloAndEstado_NombreEstadoIn(
                        ap.getArticulo(), List.of("Pendiente", "Enviada")
                ));

        if (tieneOCActiva) {
            throw new IllegalStateException("No se puede dar de baja un proveedor que tiene órdenes de compra activas.");
        }

        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Proveedor no encontrado con ID: " + id));

        proveedor.setFechaHoraBajaProveedor(LocalDateTime.now());
        proveedorRepository.save(proveedor);
    }

    public List<Articulo> listarArticulosPorProveedor(Long codigoProveedor) {
        //Verificar que el proveedor exista y no este dado de baja
        proveedorRepository.findByCodigoProveedorAndFechaHoraBajaProveedorIsNull(codigoProveedor)
                .orElseThrow(() -> new IllegalStateException("Proveedor inactivo o no encontrado."));

        //Verificar que no traiga articulos dados de baja
        return articuloProveedorRepository.findByProveedorCodigoProveedor(codigoProveedor)
                .stream()
                .map(ArticuloProveedor::getArticulo)
                .filter(a -> a.getFechaHoraBajaArticulo() == null)
                .collect(Collectors.toList());
    }

    public List<ArticuloProveedor> listarArticulosProveedor(Long codigoProveedor) {
        //Verificar que el proveedor exista y no este dado de baja
        proveedorRepository.findByCodigoProveedorAndFechaHoraBajaProveedorIsNull(codigoProveedor)
                .orElseThrow(() -> new IllegalStateException("Proveedor inactivo o no encontrado."));

        //Retornar las relaciones ArticuloProveedor completas
        return articuloProveedorRepository.findByProveedorCodigoProveedor(codigoProveedor)
                .stream()
                .filter(ap -> ap.getArticulo().getFechaHoraBajaArticulo() == null)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ArticuloProveedor> agregarArticulosAProveedor(Long codigoProveedor, List<ArticuloProveedorDTO> articulosDTO) {
        // Verificar que el proveedor existe y no está dado de baja
        Proveedor proveedor = proveedorRepository.findByCodigoProveedorAndFechaHoraBajaProveedorIsNull(codigoProveedor)
                .orElseThrow(() -> new IllegalStateException("Proveedor inactivo o no encontrado."));

        if (articulosDTO == null || articulosDTO.isEmpty()) {
            throw new IllegalArgumentException("Debe proporcionar al menos un artículo para asociar.");
        }

        List<ArticuloProveedor> relacionesCreadas = new ArrayList<>();

        for (ArticuloProveedorDTO dto : articulosDTO) {
            // Verificar que el artículo existe
            Articulo articulo = articuloRepository.findById(dto.getCodigoArticulo())
                    .orElseThrow(() -> new IllegalArgumentException("Artículo no encontrado con ID: " + dto.getCodigoArticulo()));

            // Verificar si ya existe la relación
            Optional<ArticuloProveedor> relacionExistente = articuloProveedorRepository
                    .findByArticuloCodigoArticuloAndProveedorCodigoProveedor(
                            articulo.getCodigoArticulo(), proveedor.getCodigoProveedor());

            ArticuloProveedor ap;

            if (relacionExistente.isPresent()) {
                // Actualizar la relación existente
                ap = relacionExistente.get();
                ap.setDemoraEntrega(dto.getDemoraEntrega());
                ap.setPrecioUnitario(dto.getPrecioUnitario());
                ap.setCargoPedido(dto.getCargoPedido());
            } else {
                // Crear nueva relación
                ap = new ArticuloProveedor();
                ap.setArticulo(articulo);
                ap.setProveedor(proveedor);
                ap.setDemoraEntrega(dto.getDemoraEntrega());
                ap.setPrecioUnitario(dto.getPrecioUnitario());
                ap.setCargoPedido(dto.getCargoPedido());

                // Crear el ID compuesto
                ArticuloProveedorId id = new ArticuloProveedorId();
                id.setArticulo(articulo.getCodigoArticulo());
                id.setProveedor(proveedor.getCodigoProveedor());
                ap.setId(id);
            }

            relacionesCreadas.add(articuloProveedorRepository.save(ap));
        }

        return relacionesCreadas;
    }

    public Optional<Proveedor> actualizarProveedor(Long id, Proveedor datosNuevos) {
        return proveedorRepository.findById(id).map(proveedor -> {
            if (proveedor.getFechaHoraBajaProveedor() != null) {
                throw new IllegalStateException("No se puede modificar un proveedor dado de baja.");
            }

            proveedor.setNombreProveedor(datosNuevos.getNombreProveedor());
            proveedor.setDireccionProveedor(datosNuevos.getDireccionProveedor());
            proveedor.setTelefonoProveedor(datosNuevos.getTelefonoProveedor());
            proveedor.setEmailProveedor(datosNuevos.getEmailProveedor());

            return proveedorRepository.save(proveedor);
        });
    }
}
