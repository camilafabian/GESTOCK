package com.gestock.service;

import com.gestock.model.Articulo;
import com.gestock.repository.ArticuloRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.gestock.model.Modelo;
import com.gestock.model.Proveedor;
import com.gestock.repository.ArticuloProveedorRepository;
import com.gestock.repository.ModeloRepository;
import com.gestock.repository.OrdenCompraArticuloRepository;
import com.gestock.repository.EstadoOrdenCompraRepository;

@ExtendWith(MockitoExtension.class)
public class ArticuloServiceTest {

    @Mock
    private ArticuloRepository articuloRepository;
    @Mock
    private ArticuloProveedorRepository articuloProveedorRepository;
    @Mock
    private OrdenCompraArticuloRepository ordenCompraArticuloRepository;
    @Mock
    private EstadoOrdenCompraRepository estadoOrdenCompraRepository;
    @Mock
    private ModeloRepository modeloRepository;
    @Mock
    private OrdenCompraArticuloService ordenCompraArticuloService;

    @InjectMocks
    private ArticuloService articuloService;

    private Articulo articulo1;
    private Articulo articulo2;

    @BeforeEach
    void setUp() {
        articulo1 = new Articulo();
        articulo1.setCodigoArticulo(1L);
        articulo1.setNombreArticulo("Articulo 1");
        articulo1.setFechaHoraBajaArticulo(null);

        articulo2 = new Articulo();
        articulo2.setCodigoArticulo(2L);
        articulo2.setNombreArticulo("Articulo 2");
        articulo2.setFechaHoraBajaArticulo(LocalDateTime.now());
    }

    @Test
    void testListarArticulos() {
        // Given
        List<Articulo> allArticulos = new ArrayList<>();
        allArticulos.add(articulo1);
        allArticulos.add(articulo2);
        when(articuloRepository.findAll()).thenReturn(allArticulos);

        // When
        List<Articulo> result = articuloService.listarArticulos();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Articulo 1", result.get(0).getNombreArticulo());
        verify(articuloRepository, times(1)).findAll();
    }

    @Test
    void testCrearArticulo_Success() {
        // Given
        Modelo modelo = new Modelo();
        modelo.setCodigoModelo(1L);
        modelo.setNombreModelo("Lote Fijo");
        articulo1.setModelo(modelo);
        when(modeloRepository.findById(1L)).thenReturn(Optional.of(modelo));
        when(articuloRepository.save(any(Articulo.class))).thenReturn(articulo1);

        // When
        Articulo result = articuloService.crearArticulo(articulo1);

        // Then
        assertNotNull(result);
        assertEquals("Articulo 1", result.getNombreArticulo());
        verify(modeloRepository, times(1)).findById(1L);
        verify(articuloRepository, times(1)).save(articulo1);
    }

    @Test
    void testCrearArticulo_ModeloNoExiste() {
        // Given
        Modelo modelo = new Modelo();
        modelo.setCodigoModelo(1L);
        articulo1.setModelo(modelo);
        when(modeloRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            articuloService.crearArticulo(articulo1);
        });
        assertEquals("El modelo especificado no existe", exception.getMessage());
        verify(modeloRepository, times(1)).findById(1L);
        verify(articuloRepository, never()).save(any(Articulo.class));
    }

    @Test
    void testBajarArticulo_Success() {
        // Given
        when(articuloRepository.findById(1L)).thenReturn(Optional.of(articulo1));
        when(ordenCompraArticuloService.tieneOCActiva(1L)).thenReturn(false);
        articulo1.setStockActual(0);

        // When
        boolean result = articuloService.bajarArticulo(1L);

        // Then
        assertTrue(result);
        assertNotNull(articulo1.getFechaHoraBajaArticulo());
        verify(articuloRepository, times(1)).findById(1L);
        verify(ordenCompraArticuloService, times(1)).tieneOCActiva(1L);
        verify(articuloRepository, times(1)).save(articulo1);
    }

    @Test
    void testBajarArticulo_ConStock() {
        // Given
        when(articuloRepository.findById(1L)).thenReturn(Optional.of(articulo1));
        articulo1.setStockActual(10);

        // When
        boolean result = articuloService.bajarArticulo(1L);

        // Then
        assertFalse(result);
        assertNull(articulo1.getFechaHoraBajaArticulo());
        verify(articuloRepository, times(1)).findById(1L);
        verify(ordenCompraArticuloService, times(1)).tieneOCActiva(1L);
        verify(articuloRepository, never()).save(any(Articulo.class));
    }

    @Test
    void testBajarArticulo_ConOCActiva() {
        // Given
        when(articuloRepository.findById(1L)).thenReturn(Optional.of(articulo1));
        when(ordenCompraArticuloService.tieneOCActiva(1L)).thenReturn(true);
        articulo1.setStockActual(0);

        // When
        boolean result = articuloService.bajarArticulo(1L);

        // Then
        assertFalse(result);
        assertNull(articulo1.getFechaHoraBajaArticulo());
        verify(articuloRepository, times(1)).findById(1L);
        verify(ordenCompraArticuloService, times(1)).tieneOCActiva(1L);
        verify(articuloRepository, never()).save(any(Articulo.class));
    }
} 