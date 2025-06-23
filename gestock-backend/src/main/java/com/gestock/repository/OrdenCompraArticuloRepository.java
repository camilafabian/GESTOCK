package com.gestock.repository;

import com.gestock.model.Articulo;
import com.gestock.model.OrdenCompraArticulo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface OrdenCompraArticuloRepository extends JpaRepository<OrdenCompraArticulo, Long>{

    boolean existsByArticuloProveedor_ArticuloAndEstado_NombreEstadoIn(Articulo articulo, List<String> estados);
    boolean existsByArticuloProveedor_Proveedor_CodigoProveedorAndEstado_NombreEstadoIn(Long idProveedor, List<String> estados);
    List<OrdenCompraArticulo> findByArticuloProveedor_ArticuloAndEstado_NombreEstadoIn(Articulo articulo, List<String> estados);
}
