package com.gestock.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Builder
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor

@Entity
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long numeroVenta;

    @NotNull(message = "La fecha de venta no puede ser nula")
    private LocalDate fechaVenta;

    @NotNull(message = "La cantidad no puede ser nula")
    @Min(value = 0, message = "La cantidad debe ser mayor o igual a 0")
    private Integer cantidadVenta;

    @NotNull(message = "El artículo no puede ser nulo")
    @ManyToOne
    @JoinColumn(name = "codigo_articulo")
    private Articulo articulo;

}
