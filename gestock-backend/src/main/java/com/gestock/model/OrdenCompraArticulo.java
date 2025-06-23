package com.gestock.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor

@Entity
public class OrdenCompraArticulo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long nroOrdenCompra;

    private Double montoTotal;
    @NonNull
    @Min(value = 0, message = "La cantidad debe ser mayor o igual a 0")
    private Integer cantidad;
    private LocalDateTime fechaHoraCompra;
    private boolean esAutomatica;
    private LocalDateTime fechaHoraBajaOC;

    @ManyToOne
    @JoinColumns({
            @JoinColumn(name = "codigo_articulo", referencedColumnName = "codigo_articulo"),
            @JoinColumn(name = "codigo_proveedor", referencedColumnName = "codigo_proveedor")
    })
    private ArticuloProveedor articuloProveedor;

    @ManyToOne
    @JoinColumn(name = "codigo_eoc")
    private EstadoOrdenCompra estado;

}
