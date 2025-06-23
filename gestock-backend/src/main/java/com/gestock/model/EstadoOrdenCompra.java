package com.gestock.model;

import jakarta.persistence.*;
import lombok.*;

@Builder
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor

@Entity
public class EstadoOrdenCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long codigoEoc;

    private String nombreEstado; // pendiente, enviada, finalizada, cancelada


}
