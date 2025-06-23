package com.gestock.controller;

import com.gestock.model.*;
import com.gestock.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articulo-proveedor")
@CrossOrigin(origins = "*")
public class ArticuloProveedorController {

    @Autowired
    private ArticuloProveedorRepository articuloProveedorRepository;

    @GetMapping
    public List<ArticuloProveedor> getAllArticuloProveedor() {
        return articuloProveedorRepository.findAll();
    }

    @PostMapping
    public ArticuloProveedor crearArticuloProveedor(@RequestBody ArticuloProveedor ap) {
        return articuloProveedorRepository.save(ap);
    }

   
}

