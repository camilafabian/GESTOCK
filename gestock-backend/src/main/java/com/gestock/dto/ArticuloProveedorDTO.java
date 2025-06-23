package com.gestock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticuloProveedorDTO {
    private Long codigoArticulo;
    private Double demoraEntrega;
    private Double precioUnitario;
    private Double cargoPedido;
}
