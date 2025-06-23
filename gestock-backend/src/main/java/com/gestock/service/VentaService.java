package com.gestock.service;

import com.gestock.model.*;
import com.gestock.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ArticuloRepository articuloRepository;

    @Autowired
    private ArticuloService articuloService;


    //@Transactional
    public Venta registrarVenta(Venta venta) {
        Articulo articulo = articuloRepository.findById(venta.getArticulo().getCodigoArticulo())
                .orElseThrow(() -> new RuntimeException("Artículo no encontrado"));

        if (articulo.getFechaHoraBajaArticulo() != null) {
            throw new IllegalStateException("Este articulo esta dado de baja");
        }

        if (articulo.getStockActual() < venta.getCantidadVenta()) {
            throw new IllegalStateException("No se puede vender más que el stock disponible.");
        }

        // Descontar stock
        articuloService.ajustarStock(articulo.getCodigoArticulo(), - venta.getCantidadVenta());
        articuloRepository.save(articulo);


        // Verificacion de Stock con Lote Fijo

        articuloService.verificarLoteFijo(articulo);

        return ventaRepository.save(venta);
    }



}
