package com.gestock.repository;

import com.gestock.model.ArticuloProveedor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface ArticuloProveedorRepository extends JpaRepository<ArticuloProveedor, Long> {
    List<ArticuloProveedor> findByArticuloCodigoArticulo(Long codigoArticulo);
    Optional<ArticuloProveedor> findByArticuloCodigoArticuloAndProveedorCodigoProveedor(Long codArticulo, Long codProveedor);
    List<ArticuloProveedor> findByProveedorCodigoProveedor(Long codProveedor);
}