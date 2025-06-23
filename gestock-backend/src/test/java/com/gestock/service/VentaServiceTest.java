package com.gestock.service;

import com.gestock.model.Articulo;
import com.gestock.model.Venta;
import com.gestock.repository.ArticuloRepository;
import com.gestock.repository.VentaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class VentaServiceTest {

    @Mock
    private VentaRepository ventaRepository;

    @Mock
    private ArticuloRepository articuloRepository;

    @Mock
    private ArticuloService articuloService;

    @InjectMocks
    private VentaService ventaService;

    private Venta venta;
    private Articulo articulo;

    @BeforeEach
    void setUp() {
        articulo = new Articulo();
        articulo.setCodigoArticulo(1L);
        articulo.setStockActual(100);

        venta = new Venta();
        venta.setArticulo(articulo);
        venta.setCantidadVenta(10);
    }

    @Test
    void testRegistrarVenta_Success() {
        when(articuloRepository.findById(1L)).thenReturn(Optional.of(articulo));
        when(ventaRepository.save(any(Venta.class))).thenReturn(venta);

        Venta result = ventaService.registrarVenta(venta);

        assertNotNull(result);
    }

    @Test
    void testRegistrarVenta_StockInsuficiente() {
        articulo.setStockActual(5);
        when(articuloRepository.findById(1L)).thenReturn(Optional.of(articulo));

        assertThrows(IllegalStateException.class, () -> ventaService.registrarVenta(venta));
    }
} 