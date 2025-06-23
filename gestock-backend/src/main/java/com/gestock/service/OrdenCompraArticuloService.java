package com.gestock.service;

import com.gestock.model.*;
import com.gestock.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class OrdenCompraArticuloService {

    @Autowired
    private OrdenCompraArticuloRepository ordenCompraArticuloRepository;

    @Autowired
    private EstadoOrdenCompraRepository estadoOrdenCompraRepository;

    @Autowired
    private ArticuloRepository articuloRepository;

    @Autowired
    private ArticuloProveedorRepository articuloProveedorRepository;
    @Autowired
    @Lazy
    private ArticuloService articuloService;

    public boolean tieneOCActiva(Long codigoArticulo) {
        Articulo articulo = articuloRepository.findById(codigoArticulo)
                .orElseThrow(() -> new IllegalArgumentException("Artículo no encontrado con ID: " + codigoArticulo));

        return ordenCompraArticuloRepository
                .existsByArticuloProveedor_ArticuloAndEstado_NombreEstadoIn(
                        articulo,
                        List.of("Pendiente", "Enviada")
                );
    }

    public OrdenCompraArticulo traerOCActivaAutomatica(Long codigoArticulo){
        Articulo articulo = articuloRepository.findById(codigoArticulo)
                .orElseThrow(() -> new IllegalArgumentException("Artículo no encontrado con ID: " + codigoArticulo));

       return  ordenCompraArticuloRepository.findByArticuloProveedor_ArticuloAndEstado_NombreEstadoIn(articulo,List.of("Pendiente"))
                .stream()
                .filter(oc -> oc.isEsAutomatica() && oc.getFechaHoraBajaOC() == null)
                .findFirst()
                .orElse(null);
    }

    public OrdenCompraArticulo crearOrdenCompra(Long codigoArticulo, Long codigoProveedor, Integer cantidad, boolean esAutomatica) {
        // Verificar si ya existe una OC activa para este artículo
        Articulo articulo = articuloRepository.findById(codigoArticulo)
                .orElseThrow(() -> new IllegalArgumentException("Artículo no encontrado con ID: " + codigoArticulo));

//        boolean tieneOCActiva = ordenCompraArticuloRepository.existsByArticuloProveedor_ArticuloAndEstado_NombreEstadoIn(
//                articulo, List.of("Pendiente", "Enviada")
//        );


        // Buscar la relación artículo-proveedor
        ArticuloProveedor articuloProveedor = articuloProveedorRepository
                .findByArticuloCodigoArticuloAndProveedorCodigoProveedor(codigoArticulo, codigoProveedor)
                .orElseThrow(() -> new IllegalArgumentException("Relación Artículo-Proveedor no encontrada."));

        // Crear la orden de compra
        OrdenCompraArticulo orden = new OrdenCompraArticulo();
        orden.setArticuloProveedor(articuloProveedor);
        orden.setCantidad(cantidad);
        orden.setEsAutomatica(esAutomatica);
        orden.setMontoTotal(orden.getCantidad() * articuloProveedor.getPrecioUnitario());
        orden.setFechaHoraCompra(LocalDateTime.now());

        // Establecer estado pendiente
        EstadoOrdenCompra estadoPendiente = estadoOrdenCompraRepository
                .findByNombreEstadoIgnoreCase("Pendiente")
                .orElseThrow(() -> new IllegalStateException("El estado 'Pendiente' no está definido."));
        orden.setEstado(estadoPendiente);

        return ordenCompraArticuloRepository.save(orden);
    }


    public String enviarOrdenCompra(Long id) {
        OrdenCompraArticulo orden = ordenCompraArticuloRepository.findById(id)
                .orElseThrow(NoSuchElementException::new);

        if (!orden.getEstado().getNombreEstado().equalsIgnoreCase("Pendiente")) {
            throw new IllegalStateException("Solo se puede enviar una OC en estado 'Pendiente'.");
        }

        // Validar que no supere el stock máximo
        Articulo articulo = orden.getArticuloProveedor().getArticulo();
        if (articulo.getStockMaximo() != null) {
            int stockFuturo = articulo.getStockActual() + orden.getCantidad();
            if (stockFuturo > articulo.getStockMaximo()) {
                throw new IllegalStateException("No se puede enviar la orden. El stock resultante (" + stockFuturo + 
                    ") superaría el stock máximo permitido (" + articulo.getStockMaximo() + ").");
            }
        }

        EstadoOrdenCompra estadoEnviada = estadoOrdenCompraRepository
                .findByNombreEstadoIgnoreCase("Enviada")
                .orElseThrow(() -> new IllegalStateException("El estado 'Enviada' no está definido."));

        orden.setEstado(estadoEnviada);
        ordenCompraArticuloRepository.save(orden);

        return "Orden enviada exitosamente.";
    }

    public String cancelarOrdenCompra(Long id) {
        OrdenCompraArticulo orden = ordenCompraArticuloRepository.findById(id)
                .orElseThrow(NoSuchElementException::new);

        if (!orden.getEstado().getNombreEstado().equalsIgnoreCase("Pendiente")) {
            throw new IllegalStateException("Solo se puede cancelar una OC en estado 'Pendiente'.");
        }

        EstadoOrdenCompra estadoCancelado = estadoOrdenCompraRepository
                .findByNombreEstadoIgnoreCase("Cancelada")
                .orElseThrow(() -> new IllegalStateException("El estado 'Cancelada' no está definido."));

        orden.setEstado(estadoCancelado);
        ordenCompraArticuloRepository.save(orden);

        return "Orden cancelada exitosamente.";
    }


    public String finalizarOrdenCompra(Long id) {
        OrdenCompraArticulo orden = ordenCompraArticuloRepository.findById(id)
                .orElseThrow(NoSuchElementException::new);

        if (!orden.getEstado().getNombreEstado().equalsIgnoreCase("enviada")) {
            throw new IllegalStateException("Solo puede finalizarse una OC en estado 'Enviada'.");
        }

        EstadoOrdenCompra estadoFinalizada = estadoOrdenCompraRepository
                .findByNombreEstadoIgnoreCase("finalizada")
                .orElseThrow(() -> new IllegalStateException("El estado 'Finalizada' no está definido."));

        orden.setEstado(estadoFinalizada);

        Articulo articulo = orden.getArticuloProveedor().getArticulo(); //GUARDA CON ESTOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
        articuloService.ajustarStock(articulo.getCodigoArticulo(), orden.getCantidad()); //ACABO DE HACER ESTO

        articuloRepository.save(articulo);
        ordenCompraArticuloRepository.save(orden);

        boolean esLoteFijo = articulo.getModelo() != null &&
                articulo.getModelo().getNombreModelo().equalsIgnoreCase("lote fijo");

        boolean siguePorDebajo = articulo.getStockActual() < articulo.getPuntoPedido();

        if (esLoteFijo && siguePorDebajo) {
            return "Orden finalizada. El stock sigue por debajo del Punto de Pedido.";
        }

        return "Orden finalizada correctamente.";
    }
}
