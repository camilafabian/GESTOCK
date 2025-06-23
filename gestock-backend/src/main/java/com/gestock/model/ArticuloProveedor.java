package com.gestock.model;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.sql.Time;

@Builder
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor

@Entity
public class ArticuloProveedor {


    @EmbeddedId
    private ArticuloProveedorId id;

    @NonNull
    @Min(value = 0, message = "La demora debe ser mayor o igual a 0")
    private Double demoraEntrega;
    @NonNull
    @Min(value = 0, message = "El precio unitario debe ser mayor o igual a 0")
    private Double precioUnitario;
    @NonNull
    @Min(value = 0, message = "El cargo de pedido debe ser mayor o igual a 0")
    private Double cargoPedido;

    @ManyToOne
    @MapsId("articulo")
    @JoinColumn(name = "codigo_articulo")
    private Articulo articulo;

    @ManyToOne
    @MapsId("proveedor")
    @JoinColumn(name = "codigo_proveedor")
    private Proveedor proveedor;

}
