package com.gestock.model;

import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDateTime;

@Builder
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor

@Entity
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long codigoProveedor;

    @NonNull
    private String nombreProveedor;
    @NonNull
    private String direccionProveedor;
    @NonNull
    private Long telefonoProveedor;
    @NonNull
    private String emailProveedor;
    private LocalDateTime fechaHoraBajaProveedor;

}
