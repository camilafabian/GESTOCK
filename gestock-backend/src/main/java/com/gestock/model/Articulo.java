package com.gestock.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Builder
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor

@Entity
public class Articulo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long codigoArticulo;


    @NonNull
    private String nombreArticulo;
    @NonNull
    private String descripcionArticulo;
    @NonNull
    @Min(value = 0, message = "La demanda debe ser mayor o igual a 0")
    private Double demandaArticulo;
    @NonNull
    @Min(value = 0, message = "El costo debe ser mayor o igual a 0")
    private Double costoAlmacenamiento;
    @NonNull
    @Min(value = 0, message = "El stock actual debe ser mayor o igual a 0")
    private Integer stockActual;
    @NonNull
    @Min(value = 0, message = "El stock maximo debe ser mayor o igual a 0")
    private Integer stockMaximo;
    private Integer stockSeguridad;
    private Integer loteOptimo;
    private Integer puntoPedido;
    private Integer intervaloEnDias;
    private Double valorCgi;
    @NonNull
    private Double nivelServicio;
    @NonNull
    private Double desviacionEstandar;
    private LocalDateTime fechaUltimaRepoArticulo;
    private LocalDateTime fechaHoraBajaArticulo;
    private String urlImagen;

    @ManyToOne
    @JoinColumn(name = "proveedor_predeterminado")
    private Proveedor proveedorPredeterminado;

    @ManyToOne
    @JoinColumn(name = "modelo_id")
    private Modelo modelo;

}


