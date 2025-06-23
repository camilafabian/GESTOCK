package com.gestock.service;

import com.gestock.model.*;
import com.gestock.repository.ArticuloProveedorRepository;
import com.gestock.repository.ArticuloRepository;
import com.gestock.repository.EstadoOrdenCompraRepository;
import com.gestock.repository.OrdenCompraArticuloRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class OrdenCompraArticuloServiceTest {

    @Mock
    private OrdenCompraArticuloRepository ordenCompraArticuloRepository;
    @Mock
    private EstadoOrdenCompraRepository estadoOrdenCompraRepository;
    @Mock
    private ArticuloRepository articuloRepository;
    @Mock
    private ArticuloProveedorRepository articuloProveedorRepository;
    @Mock
    private ArticuloService articuloService;

    @InjectMocks
    private OrdenCompraArticuloService ordenCompraArticuloService;

    private Articulo articulo;
    private Proveedor proveedor;
    private ArticuloProveedor articuloProveedor;
    private OrdenCompraArticulo ordenCompraArticulo;
    private EstadoOrdenCompra estadoPendiente;
    private EstadoOrdenCompra estadoEnviada;
    private EstadoOrdenCompra estadoCancelada;
    private EstadoOrdenCompra estadoFinalizada;

    @BeforeEach
    void setUp() {
        articulo = new Articulo();
        articulo.setCodigoArticulo(1L);
        articulo.setStockActual(10);
        articulo.setStockMaximo(100);

        proveedor = new Proveedor();
        proveedor.setCodigoProveedor(1L);

        articuloProveedor = new ArticuloProveedor();
        articuloProveedor.setArticulo(articulo);
        articuloProveedor.setProveedor(proveedor);
        articuloProveedor.setPrecioUnitario(10.0);

        estadoPendiente = new EstadoOrdenCompra();
        estadoPendiente.setNombreEstado("Pendiente");

        estadoEnviada = new EstadoOrdenCompra();
        estadoEnviada.setNombreEstado("Enviada");

        estadoCancelada = new EstadoOrdenCompra();
        estadoCancelada.setNombreEstado("Cancelada");

        estadoFinalizada = new EstadoOrdenCompra();
        estadoFinalizada.setNombreEstado("Finalizada");

        ordenCompraArticulo = new OrdenCompraArticulo();
        ordenCompraArticulo.setNroOrdenCompra(1L);
        ordenCompraArticulo.setArticuloProveedor(articuloProveedor);
        ordenCompraArticulo.setCantidad(20);
        ordenCompraArticulo.setEstado(estadoPendiente);
    }

    @Test
    void testCrearOrdenCompra() {
        when(articuloRepository.findById(anyLong())).thenReturn(Optional.of(articulo));
        when(articuloProveedorRepository.findByArticuloCodigoArticuloAndProveedorCodigoProveedor(anyLong(), anyLong())).thenReturn(Optional.of(articuloProveedor));
        when(estadoOrdenCompraRepository.findByNombreEstadoIgnoreCase("Pendiente")).thenReturn(Optional.of(estadoPendiente));
        when(ordenCompraArticuloRepository.save(any(OrdenCompraArticulo.class))).thenReturn(ordenCompraArticulo);

        OrdenCompraArticulo result = ordenCompraArticuloService.crearOrdenCompra(1L, 1L, 20, false);

        assertNotNull(result);
        assertEquals(20, result.getCantidad());
        assertEquals("Pendiente", result.getEstado().getNombreEstado());
    }

    @Test
    void testEnviarOrdenCompra_Success() {
        when(ordenCompraArticuloRepository.findById(1L)).thenReturn(Optional.of(ordenCompraArticulo));
        when(estadoOrdenCompraRepository.findByNombreEstadoIgnoreCase("Enviada")).thenReturn(Optional.of(estadoEnviada));

        String result = ordenCompraArticuloService.enviarOrdenCompra(1L);

        assertEquals("Orden enviada exitosamente.", result);
        assertEquals("Enviada", ordenCompraArticulo.getEstado().getNombreEstado());
    }

    @Test
    void testEnviarOrdenCompra_StockSuperaMaximo() {
        articulo.setStockMaximo(25); // stock actual 10 + cantidad 20 = 30 > 25
        when(ordenCompraArticuloRepository.findById(1L)).thenReturn(Optional.of(ordenCompraArticulo));

        assertThrows(IllegalStateException.class, () -> ordenCompraArticuloService.enviarOrdenCompra(1L));
    }

    @Test
    void testCancelarOrdenCompra_Success() {
        when(ordenCompraArticuloRepository.findById(1L)).thenReturn(Optional.of(ordenCompraArticulo));
        when(estadoOrdenCompraRepository.findByNombreEstadoIgnoreCase("Cancelada")).thenReturn(Optional.of(estadoCancelada));

        String result = ordenCompraArticuloService.cancelarOrdenCompra(1L);

        assertEquals("Orden cancelada exitosamente.", result);
        assertEquals("Cancelada", ordenCompraArticulo.getEstado().getNombreEstado());
    }
} 