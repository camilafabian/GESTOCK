export interface Articulo {
  codigoArticulo: number
  nombreArticulo: string
  descripcionArticulo: string
  demandaArticulo: number
  costoAlmacenamiento: number
  costoPedido?: number
  costoCompra?: number
  stockActual?: number
  stockMaximo?: number
  nivelServicio?: number
  stockSeguridad?: number
  desviacionEstandar?:number
  loteOptimo?: number
  puntoPedido?: number
  inventarioMaximo?: number
  valorCgi?: number
  fechaHoraBajaArticulo?: string
  fechaUltimaRepoArticulo?: string
  urlImagen?: string
  intervaloEnDias?: number
  proveedorPredeterminado?: Proveedor
  modelo?: Modelo
}

export interface Proveedor {
  codigoProveedor: number
  nombreProveedor: string
  direccionProveedor: string
  telefonoProveedor: number
  emailProveedor: string
  fechaHoraBajaProveedor?: string
}

export interface Modelo {
  codigoModelo: number
  nombreModelo: string
}

export interface ArticuloProveedor {
  id: ArticuloProveedorId
  demoraEntrega: number
  precioUnitario: number
  cargoPedido: number
  articulo: Articulo
  proveedor: Proveedor
}

export interface ArticuloProveedorId {
  articulo: number
  proveedor: number
}

export interface OrdenCompraArticulo {
  nroOrdenCompra: number
  montoTotal: number
  cantidad: number
  fechaHoraCompra: string
  articuloProveedor: ArticuloProveedor
  estado: EstadoOrdenCompra
  fechaHoraBajaOC: string
  esAutomatica: boolean
}

export interface EstadoOrdenCompra {
  codigoEoc: number
  nombreEstado: string
}

export interface Venta {
  nroVenta: number
  articulo: Articulo
  cantidadVenta: number
  fechaHoraVenta: string
  precioUnitarioVenta: number
  montoTotalVenta: number
}

export interface ArticuloProveedorDTO {
  codigoArticulo: number
  demoraEntrega: number
  precioUnitario: number
  cargoPedido: number
}
