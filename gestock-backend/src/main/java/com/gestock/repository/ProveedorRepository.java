package com.gestock.repository;

import com.gestock.model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {

    Optional<Proveedor> findByCodigoProveedorAndFechaHoraBajaProveedorIsNull(Long codigo);
}