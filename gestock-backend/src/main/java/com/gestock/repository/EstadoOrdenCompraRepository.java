package com.gestock.repository;

import com.gestock.model.EstadoOrdenCompra;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EstadoOrdenCompraRepository extends JpaRepository<EstadoOrdenCompra, Long> {
    Optional<EstadoOrdenCompra> findByNombreEstadoIgnoreCase(String nombreEstado);
}
