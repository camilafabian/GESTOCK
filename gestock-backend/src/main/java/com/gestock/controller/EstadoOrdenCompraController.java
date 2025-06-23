package com.gestock.controller;

import com.gestock.model.EstadoOrdenCompra;
import com.gestock.repository.EstadoOrdenCompraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estado-orden-compra")
@CrossOrigin(origins = "*")
public class EstadoOrdenCompraController {

    @Autowired
    private EstadoOrdenCompraRepository estadoOrdenCompraRepository;

    @GetMapping
    public List<EstadoOrdenCompra> getEstadoOrdenCompra() {
        return estadoOrdenCompraRepository.findAll();
    }

}