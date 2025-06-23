package com.gestock.repository;

import com.gestock.model.Articulo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArticuloRepository extends JpaRepository<Articulo, Long> {
    boolean existsByProveedorPredeterminado_CodigoProveedorAndFechaHoraBajaArticuloIsNull(Long idProveedor);
    List<Articulo> findByModelo_NombreModeloIgnoreCase(String nombreModelo);
}
