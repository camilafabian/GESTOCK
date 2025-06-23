import axios from "axios"
import type {
  Articulo,
  Proveedor,
  Modelo,
  OrdenCompraArticulo,
  EstadoOrdenCompra,
  Venta,
  ArticuloProveedorDTO,
  ArticuloProveedor,
} from "../types"

const API_BASE_URL = "http://localhost:8080/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Artículos
export const articulosApi = {
  getAll: () => api.get<Articulo[]>("/articulo"),
  create: (articulo: Omit<Articulo, "codigoArticulo">) => api.post<Articulo>("/articulo", articulo),
  update: (id: number, articulo: Partial<Articulo>) => api.put<Articulo>(`/articulo/${id}`, articulo),
  delete: (id: number) => api.put<string>(`/articulo/baja/${id}`),
  getAReponer: () => api.get<Articulo[]>("/articulo/a-reponer"),
  getFaltantes: () => api.get<Articulo[]>("/articulo/faltantes"),
  getProveedores: (id: number) => api.get<Proveedor[]>(`/articulo/${id}/proveedores`),
}

// Proveedores
export const proveedoresApi = {
  getAll: () => api.get<Proveedor[]>("/proveedor"),
  create: (proveedor: Omit<Proveedor, "codigoProveedor">) => api.post<Proveedor>("/proveedor", proveedor),
  createWithArticulos: (data: { proveedor: Omit<Proveedor, "codigoProveedor">; articulos: ArticuloProveedorDTO[] }) =>
    api.post<Proveedor>("/proveedor/con-articulos", data),
  update: (id: number, proveedor: Partial<Proveedor>) => api.put<Proveedor>(`/proveedor/${id}`, proveedor),
  delete: (id: number) => api.put<string>(`/proveedor/baja/${id}`),
  getArticulos: (id: number) => api.get<Articulo[]>(`/proveedor/articulos/${id}`),
  getArticulosProveedor: (id: number) => api.get<ArticuloProveedor[]>(`/proveedor/${id}/articulos-proveedor`),
  addArticulos: (id: number, articulos: ArticuloProveedorDTO[]) => api.post(`/proveedor/${id}/articulos`, articulos),
}

// Modelos
export const modelosApi = {
  getAll: () => api.get<Modelo[]>("/modelo"),
}

// Estados de Orden de Compra
export const estadosApi = {
  getAll: () => api.get<EstadoOrdenCompra[]>("/estado-orden-compra"),
}

// Órdenes de Compra
export const ordenesCompraApi = {
  getAll: () => api.get<OrdenCompraArticulo[]>("/ordenCompraArticulo"),
  create: (orden: Omit<OrdenCompraArticulo, "nroOrdenCompra">) =>
    api.post<OrdenCompraArticulo>("/ordenCompraArticulo", orden),
  createNew: (codigoArticulo: number, codigoProveedor?: number, cantidad?: number, forzarCreacion = false, esAutomatica = false) =>
    api.post<OrdenCompraArticulo>("/ordenCompraArticulo/crear", null, {
      params: { codigoArticulo, codigoProveedor, cantidad, forzarCreacion, esAutomatica},
    }),
  update: (id: number, orden: Partial<OrdenCompraArticulo>) =>
    api.put<OrdenCompraArticulo>(`/ordenCompraArticulo/${id}`, orden),
  cancel: (id: number) => api.put<string>(`/ordenCompraArticulo/baja/${id}`),
  enviar: (id: number) => api.put<string>(`/ordenCompraArticulo/enviar/${id}`),
  finalizar: (id: number) => api.put<string>(`/ordenCompraArticulo/finalizar/${id}`),
  tieneOCActiva: (codigoArticulo: number) => api.get<boolean>(`/ordenCompraArticulo/tieneOCActiva/${codigoArticulo}`),
}

// Ventas
export const ventasApi = {
  create: (venta: Omit<Venta, "numeroVenta">) => api.post<Venta>("/venta", venta),
}

export default api
