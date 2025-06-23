package com.gestock.service;

import com.gestock.controller.OrdenCompraArticuloController;
import com.gestock.model.*;
import com.gestock.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.apache.commons.math3.distribution.NormalDistribution;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ArticuloService {
    @Autowired
    private ArticuloRepository articuloRepository;

    @Autowired
    private ArticuloProveedorRepository articuloProveedorRepository;

    @Autowired
    private OrdenCompraArticuloRepository ordenCompraArticuloRepository;

    @Autowired
    private EstadoOrdenCompraRepository estadoOrdenCompraRepository;

    @Autowired
    private ModeloRepository modeloRepository;
    @Autowired
    @Lazy
    private OrdenCompraArticuloService ordenCompraArticuloService;

    public List<Articulo> listarArticulos() {
        return articuloRepository.findAll().stream()
                .filter(a -> a.getFechaHoraBajaArticulo() == null)
                .collect(Collectors.toList());
    }

    public Articulo crearArticulo(Articulo articulo) {

        // Validar y cargar el modelo
        if (articulo.getModelo() != null && articulo.getModelo().getCodigoModelo() != null) {
            Modelo modelo = modeloRepository.findById(articulo.getModelo().getCodigoModelo())
                    .orElseThrow(() -> {
                        return new IllegalStateException("El modelo especificado no existe");
                    });
            articulo.setModelo(modelo);
        } else {
            throw new IllegalStateException("El artículo debe tener un modelo asignado");
        }

        try {
            // Solo recalcular parámetros si hay proveedor predeterminado
            if (articulo.getProveedorPredeterminado() != null) {
                recalcularParametrosInventario(articulo);
            }

            return articuloRepository.save(articulo);
        } catch (Exception e) {
            System.err.println("Error al procesar el artículo: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Optional<Articulo> actualizarArticulo(Long id, Articulo datosNuevos) {
        Optional<Articulo> optionalArticulo = articuloRepository.findById(id);

        if (optionalArticulo.isEmpty()) return Optional.empty();

        Articulo articuloViejo = optionalArticulo.get();

        if (articuloViejo.getFechaHoraBajaArticulo() != null) {
            throw new IllegalStateException("No se puede modificar un artículo dado de baja.");
        }

        return articuloRepository.findById(id).map(articulo -> {
            articulo.setNombreArticulo(datosNuevos.getNombreArticulo());
            articulo.setDescripcionArticulo(datosNuevos.getDescripcionArticulo());
            articulo.setDemandaArticulo(datosNuevos.getDemandaArticulo());
            articulo.setCostoAlmacenamiento(datosNuevos.getCostoAlmacenamiento());
            articulo.setStockActual(datosNuevos.getStockActual());
            articulo.setStockMaximo(datosNuevos.getStockMaximo());
            articulo.setDesviacionEstandar(datosNuevos.getDesviacionEstandar());
            articulo.setNivelServicio(datosNuevos.getNivelServicio());
            articulo.setProveedorPredeterminado(datosNuevos.getProveedorPredeterminado());
            articulo.setModelo(datosNuevos.getModelo());
            articulo.setUrlImagen(datosNuevos.getUrlImagen());
            articulo.setIntervaloEnDias(datosNuevos.getIntervaloEnDias());

            // Validar que el stock actual no sea mayor al stock máximo
            if (articulo.getStockActual() > articulo.getStockMaximo()) {
                throw new IllegalStateException("No se puede establecer un stock actual mayor al stock máximo para el artículo");
            }

            // Validar que se asigne un proveedor predeterminado para poder calcular CGI
            if (articulo.getProveedorPredeterminado() != null) {
                recalcularParametrosInventario(articulo);
                calcularCGI(articulo);
                verificarLoteFijo(articulo);
                if(articulo.getModelo().getNombreModelo().equalsIgnoreCase("Intervalo Fijo") && articulo.getFechaUltimaRepoArticulo() == null){
                    articulo.setFechaUltimaRepoArticulo(LocalDateTime.now());
                }
            }


            if(datosNuevos.getModelo().getNombreModelo().equalsIgnoreCase("Intervalo Fijo")){
                articulo.setFechaUltimaRepoArticulo(LocalDateTime.now());
            }
            return articuloRepository.save(articulo);
        });
    }

    //Control de baja contra la tabla de Ord Compra. No permitir si el artículo tiene una
    //orden de compra pendiente o enviada.
    //No permitir si el artículo tiene unidades en stock
    public boolean bajarArticulo(Long id) {
        Optional<Articulo> optionalArticulo = articuloRepository.findById(id);
        if (optionalArticulo.isEmpty()) return false;

        Articulo articulo = optionalArticulo.get();
        boolean tieneStock = articulo.getStockActual() > 0;
        boolean tieneOCActiva = ordenCompraArticuloService.tieneOCActiva(
                articulo.getCodigoArticulo()
        );

        if (!tieneStock && !tieneOCActiva) {
            articulo.setFechaHoraBajaArticulo(LocalDateTime.now());
            articuloRepository.save(articulo);
            return true;
        }
        return false;
    }

    //Recalcular cuando cambian los datos de cualquier variable de la formula
    public void recalcularParametrosInventario(Articulo articulo) {
        if (articulo.getModelo() == null) return;
        String nombreModelo = articulo.getModelo().getNombreModelo().toLowerCase();

        if (articulo.getProveedorPredeterminado() == null) return;


        Long codArticulo = articulo.getCodigoArticulo();
        Long codProveedor = articulo.getProveedorPredeterminado().getCodigoProveedor();

        ArticuloProveedor articuloProveedor = articuloProveedorRepository
                .findByArticuloCodigoArticuloAndProveedorCodigoProveedor(codArticulo, codProveedor)
                .orElseThrow(() -> new IllegalStateException(
                        "No se encontró la relación entre el artículo y el proveedor predeterminado."));


        // Paso el nivel de servicio de porcentaje a z
        Double nivelServicio = articulo.getNivelServicio();
        if (nivelServicio <= 0 || nivelServicio >= 100) {
            throw new IllegalArgumentException("El porcentaje debe estar entre 0 y 100 (exclusivo)");
        }
        NormalDistribution normal = new NormalDistribution();
        double nivelServicioParaCalculo = (nivelServicio/2)+50;
        double z = normal.inverseCumulativeProbability(nivelServicioParaCalculo / 100.0);


        double desviacionEstandar = articulo.getDesviacionEstandar();

        if (desviacionEstandar < 0) {
            throw new IllegalArgumentException("La desviación estándar no puede ser negativa.");
        }

        // Calculo de Stock de Seguridad
        int inventarioSeguridad = (int) Math.ceil(z * desviacionEstandar);
        articulo.setStockSeguridad(inventarioSeguridad);


        // Calculo del modelo de Lote Fijo
        if (nombreModelo.contains("lote fijo")) {
            // Demanda anual
            double D = articulo.getDemandaArticulo();

            double S = articuloProveedor.getCargoPedido();
            // Costo almacenamiento
            double H = articulo.getCostoAlmacenamiento();
            // Demanda diaria
            double d = D/365.0;
            // Demora de entrega
            double L = articuloProveedor.getDemoraEntrega();

            articulo.setLoteOptimo((int) Math.ceil(Math.sqrt(2 * D * S / H)));
            articulo.setPuntoPedido((int)Math.ceil(d * L + inventarioSeguridad));
        }
    }



    //Para cada artículo el sistema me debe permitir calcular el valor del CGI.
    public void calcularCGI(Articulo articulo) {
        if (articulo == null) {
            throw new IllegalArgumentException("El artículo no puede ser nulo");
        }
        if(articulo.getModelo().getNombreModelo().equalsIgnoreCase("Lote Fijo")) {

        if (articulo.getLoteOptimo() == null || articulo.getLoteOptimo() == 0 || articulo.getCostoAlmacenamiento() == null) {
            throw new IllegalArgumentException("Faltan datos en el artículo para calcular el CGI");
        }

        double D = articulo.getDemandaArticulo();

        ArticuloProveedor articuloProveedor = articuloProveedorRepository
                .findByArticuloCodigoArticuloAndProveedorCodigoProveedor(articulo.getCodigoArticulo(), articulo.getProveedorPredeterminado().getCodigoProveedor())
                .orElseThrow(() -> new IllegalStateException(
                        "No se encontró la relación entre el artículo y el proveedor predeterminado."));


            double C = articuloProveedor.getPrecioUnitario();
            double Q = articulo.getLoteOptimo();
            double S = articuloProveedor.getCargoPedido();
            double H = articulo.getCostoAlmacenamiento();

            Double cgi = (D * C) + ((D / Q) * S) + ((Q / 2) * H);
            articulo.setValorCgi(cgi);
        } else{
            articulo.setValorCgi(10.0);
        }
    }

    //Listado de los artículos que hayan alcanzado el punto de pedido (o estén por debajo) y
    //no tengan una orden de compra pendiente o enviada
    public List<Articulo> listarAReponer() {
        return articuloRepository.findAll().stream()
                .filter(a -> a.getFechaHoraBajaArticulo() == null)
                .filter(a -> a.getStockActual() != null && a.getPuntoPedido() != null && a.getStockActual() <= a.getPuntoPedido())
                .filter(a -> !ordenCompraArticuloRepository.existsByArticuloProveedor_ArticuloAndEstado_NombreEstadoIn(
                        a, List.of("Pendiente", "Enviada")
                ))
                .collect(Collectors.toList());
    }

    //Listado de los productos estén dentro de su stock de seguridad
    public List<Articulo> listarFaltantes() {
        return articuloRepository.findAll().stream()
                .filter(a -> a.getFechaHoraBajaArticulo() == null)
                .filter(a -> a.getStockActual() != null && a.getStockSeguridad() != null && a.getStockActual() <= a.getStockSeguridad())
                .collect(Collectors.toList());
    }

    //Listado que permita identificar todos los proveedores cargados para un artículo
    public List<Proveedor> listarProveedoresDeArticulo(Long codigoArticulo) {
        return articuloProveedorRepository.findByArticuloCodigoArticulo(codigoArticulo)
                .stream()
                .map(ArticuloProveedor::getProveedor)
                .filter(p -> p.getFechaHoraBajaProveedor() == null)
                .distinct()
                .collect(Collectors.toList());
    }

    public void ajustarStock(Long codigoArticulo, int cantidad) {
        Articulo articulo = articuloRepository.findById(codigoArticulo)
                .orElseThrow(() -> new IllegalStateException("Artículo no encontrado"));

        if (articulo.getFechaHoraBajaArticulo() != null) {
            throw new IllegalStateException("No se puede modificar el stock de un artículo dado de baja");
        }

        int nuevoStock = articulo.getStockActual() + cantidad;
        
        if (nuevoStock > articulo.getStockMaximo()) {
            throw new IllegalStateException(
                String.format("No se puede establecer un stock (%d) mayor al máximo permitido (%d) para el artículo %s",
                    nuevoStock,
                    articulo.getStockMaximo(),
                    articulo.getNombreArticulo())
            );
        }

        articulo.setStockActual(nuevoStock);
        articuloRepository.save(articulo);
    }

    // REVISARRRRRRRRRRRRRRRRRRRRRRRRRRRRRR

    public void verificarLoteFijo(Articulo articulo) {
        if ("Lote Fijo".equalsIgnoreCase(articulo.getModelo().getNombreModelo())) {
            boolean tieneOCActiva = ordenCompraArticuloService.tieneOCActiva(articulo.getCodigoArticulo());
            if (!tieneOCActiva && articulo.getStockActual() <= articulo.getPuntoPedido()) {
                System.out.println("Creando Orden de compra...");
                ordenCompraArticuloService.crearOrdenCompra(
                        articulo.getCodigoArticulo(),
                        articulo.getProveedorPredeterminado().getCodigoProveedor(),
                        articulo.getLoteOptimo(),
                        true
                );
            }
        }
    }

    @Scheduled(cron = "*/30 * * * * *")
    public void verificarReposicionesPorIntervalo() {
        List<Articulo> articulos = articuloRepository.findAll();

        for (Articulo articulo : articulos) {
            if (articulo.getModelo() != null &&
                    articulo.getModelo().getNombreModelo().equalsIgnoreCase("intervalo fijo") &&
                    articulo.getIntervaloEnDias() != null &&
                    articulo.getFechaUltimaRepoArticulo() != null) {

                long diasDesdeUltimaReposicion = ChronoUnit.MINUTES.between(
                        articulo.getFechaUltimaRepoArticulo(),
                        java.time.LocalDateTime.now());

                if (diasDesdeUltimaReposicion >= articulo.getIntervaloEnDias()) {
                    articulo.setFechaUltimaRepoArticulo(LocalDateTime.now());
                   OrdenCompraArticulo ordenCompraAutomaticaActiva = ordenCompraArticuloService.traerOCActivaAutomatica(articulo.getCodigoArticulo());
                    if(ordenCompraAutomaticaActiva != null) {
                        ordenCompraAutomaticaActiva.setFechaHoraBajaOC(LocalDateTime.now());
                        EstadoOrdenCompra estadoCancelado = estadoOrdenCompraRepository
                                .findByNombreEstadoIgnoreCase("Cancelada")
                                .orElseThrow(() -> new IllegalStateException("El estado 'Cancelada' no está definido."));

                        ordenCompraAutomaticaActiva.setEstado(estadoCancelado);
                        ordenCompraArticuloRepository.save(ordenCompraAutomaticaActiva);
                    }
                    ordenCompraArticuloService.crearOrdenCompra(articulo.getCodigoArticulo(), articulo.getProveedorPredeterminado().getCodigoProveedor(), articulo.getStockMaximo() - articulo.getStockActual(), true);
                    articuloRepository.save(articulo);
                }
            }
        }
    }
}
