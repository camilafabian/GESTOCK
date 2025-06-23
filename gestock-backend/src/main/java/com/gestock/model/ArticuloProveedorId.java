package com.gestock.model;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Builder
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor

@Embeddable
public class ArticuloProveedorId implements Serializable {
    private Long articulo;
    private Long proveedor;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        //Compara si los dos objetos son la misma instancia en memoria
        if (!(o instanceof ArticuloProveedorId that)) return false;
        //Verifica que o sea un objeto de la misma clase. Si no lo es, no pueden ser iguales.
        return articulo.equals(that.articulo) && proveedor.equals(that.proveedor);
        //Compara los campos articulo y proveedor para asegurarse de que los valores sean iguales
    }

    @Override
    public int hashCode() {
        return Objects.hash(articulo, proveedor);
        //Genera un código hash usando los campos.
    }
    //Ambos metodos Override se utilizan para evitar datos duplicados en la bd, debido a la complejidad de las pk compuestas
}

