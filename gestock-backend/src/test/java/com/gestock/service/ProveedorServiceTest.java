package com.gestock.service;

import com.gestock.model.Proveedor;
import com.gestock.repository.ArticuloRepository;
import com.gestock.repository.ProveedorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProveedorServiceTest {

    @Mock
    private ProveedorRepository proveedorRepository;

    @Mock
    private ArticuloRepository articuloRepository;

    @InjectMocks
    private ProveedorService proveedorService;

    private Proveedor proveedor1;
    private Proveedor proveedor2;

    @BeforeEach
    void setUp() {
        proveedor1 = new Proveedor();
        proveedor1.setCodigoProveedor(1L);
        proveedor1.setNombreProveedor("Proveedor 1");
        proveedor1.setFechaHoraBajaProveedor(null);

        proveedor2 = new Proveedor();
        proveedor2.setCodigoProveedor(2L);
        proveedor2.setNombreProveedor("Proveedor 2");
        proveedor2.setFechaHoraBajaProveedor(LocalDateTime.now());
    }

    @Test
    void testListarProveedores() {
        // Given
        List<Proveedor> allProveedores = new ArrayList<>();
        allProveedores.add(proveedor1);
        allProveedores.add(proveedor2);
        when(proveedorRepository.findAll()).thenReturn(allProveedores);

        // When
        List<Proveedor> result = proveedorService.listarProveedores();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Proveedor 1", result.get(0).getNombreProveedor());
        verify(proveedorRepository, times(1)).findAll();
    }

    @Test
    void testBajarProveedor_EsPredeterminado() {
        // Given
        when(articuloRepository.existsByProveedorPredeterminado_CodigoProveedorAndFechaHoraBajaArticuloIsNull(1L)).thenReturn(true);

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            proveedorService.bajarProveedor(1L);
        });
        assertEquals("No se puede dar de baja un proveedor que es predeterminado de algún artículo.", exception.getMessage());
        verify(proveedorRepository, never()).save(any(Proveedor.class));
    }
} 