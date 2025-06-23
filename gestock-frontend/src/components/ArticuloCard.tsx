"use client"

import type React from "react"
import type { Articulo } from "../types"
import { Package, AlertTriangle, CheckCircle, Edit, Trash2, ShoppingCart, Settings } from "lucide-react"

interface ArticuloCardProps {
  articulo: Articulo
  onCreateOrder: (articulo: Articulo) => void
  onRegisterSale: (articulo: Articulo) => void
  onEdit: (articulo: Articulo) => void
  onDelete: (articulo: Articulo) => void
  onAdjustStock: (articulo: Articulo) => void
}

const ArticuloCard: React.FC<ArticuloCardProps> = ({ articulo, onCreateOrder, onRegisterSale, onEdit, onDelete, onAdjustStock }) => {
  const getBrandBadgeClass = (nombre: string) => {
    const brand = nombre.toLowerCase()
    if (brand.includes("apple")) return "bg-gray-100 text-gray-800"
    if (brand.includes("samsung")) return "bg-blue-100 text-blue-800"
    if (brand.includes("xiaomi")) return "bg-orange-100 text-orange-800"
    if (brand.includes("motorola")) return "bg-blue-100 text-blue-800"
    if (brand.includes("huawei")) return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  const getModeloBadgeClass = (modelo?: string) => {
    if (!modelo) return "bg-green-100 text-green-800"
    return modelo.toLowerCase().includes("lote") ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
  }

  const getStockStatus = () => {
    if (!articulo.stockActual || !articulo.stockSeguridad) return "normal"
    if (articulo.stockActual <= articulo.stockSeguridad) return "critical"
    if (articulo.stockActual <= (articulo.puntoPedido || 0)) return "warning"
    return "normal"
  }

  const stockStatus = getStockStatus()
  const sinProveedorPredeterminado = !articulo.proveedorPredeterminado

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-gray-200 relative flex flex-col h-full">
      {/* Product Image */}
      <div className="relative w-full h-48 bg-gray-50 rounded-lg mb-4 flex items-center justify-center border overflow-hidden">
        {/* Alerta prominente de proveedor faltante superpuesta */}
        {sinProveedorPredeterminado && (
          <div className="absolute top-0 left-0 right-0 bg-yellow-50/80 border-b-2 border-yellow-400 p-2 rounded-t-lg z-20 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="text-yellow-700 ml-1">Sin proveedor predeterminado</span>
              </div>
            </div>
          </div>
        )}

        {articulo.urlImagen ? (
          // Imagen personalizada
          <img
            src={articulo.urlImagen}
            alt={articulo.nombreArticulo}
            className="w-full h-full object-contain"
            onError={(e) => {
              // Si la imagen falla, mostrar la imagen por defecto
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        
        {/* Imagen por defecto (phone mockup) */}
        <div className={`w-20 h-32 bg-gray-800 rounded-lg relative ${articulo.urlImagen ? 'hidden' : ''}`}>
          <div className="w-16 h-28 bg-white rounded-md absolute top-2 left-2 flex items-center justify-center">
            <div className="w-12 h-20 bg-gray-100 rounded flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          {/* Camera dots */}
          <div className="absolute top-1 right-1 flex space-x-1">
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          </div>
        </div>

        {/* Status indicator */}
        {stockStatus === "critical" && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-50/80 border-t-2 border-red-400 p-2 rounded-b-lg z-20 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-red-800">¡STOCK CRÍTICO!</span>
              </div>
            </div>
          </div>
        )}
        {stockStatus === "warning" && (
          <div className="absolute bottom-0 left-0 right-0 bg-orange-50/80 border-t-2 border-orange-400 p-2 rounded-b-lg z-20 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-orange-800">¡STOCK BAJO!</span>
              </div>
            </div>
          </div>
        )}
        {stockStatus === "normal" && articulo.stockActual && articulo.stockActual > (articulo.puntoPedido || 0) && (
          <div className="absolute bottom-0 left-0 right-0 bg-green-50/80 border-t-2 border-green-400 p-2 rounded-b-lg z-20 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-green-800">Stock OK</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Info - Flex grow para ocupar el espacio disponible */}
      <div className="flex-1 space-y-3">
        <h3 className="font-bold text-gray-900 text-sm uppercase">{articulo.nombreArticulo}</h3>

        <div className="text-xs text-gray-600 space-y-1">
          <div>
            <span className="font-medium">CÓDIGO:</span> {articulo.codigoArticulo}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          {articulo.modelo && (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getModeloBadgeClass(articulo.modelo.nombreModelo)}`}
            >
              {articulo.modelo.nombreModelo}
            </span>
          )}
          {articulo.proveedorPredeterminado && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-black-800">
              {articulo.proveedorPredeterminado.nombreProveedor}
            </span>
          )}
        </div>

        {/* Stock Info */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Stock remanente:</span>
            <span
              className={`font-medium ${
                stockStatus === "critical"
                  ? "text-red-600"
                  : stockStatus === "warning"
                    ? "text-yellow-600"
                    : "text-green-600"
              }`}
            >
              {articulo.stockActual || 0} Un.
            </span>
          </div>

          <div className="flex justify-between">
            <span>Stock máximo:</span>
            <span>{articulo.stockMaximo || 0} Un.</span>
          </div>

          <div className="flex justify-between">
            <span>Stock de seguridad:</span>
            <span>{articulo.stockSeguridad || 0} Un.</span>
          </div>

          {/* Solo mostrar punto de pedido y lote óptimo para artículos de lote fijo */}
          {articulo.modelo?.nombreModelo.toLowerCase().includes("lote fijo") && (
            <>
              <div className="flex justify-between">
                <span>Punto de pedido:</span>
                <span>{articulo.puntoPedido || 0} Un.</span>
              </div>

              <div className="flex justify-between">
                <span>Lote óptimo:</span>
                <span>{articulo.loteOptimo || 0} Un.</span>
              </div>
            </>
          )}

          {/* Mostrar intervalo de días para artículos de intervalo fijo */}
          {articulo.modelo?.nombreModelo.toLowerCase().includes("intervalo fijo") && (
            <div className="flex justify-between">
              <span>Intervalo de reposición:</span>
              <span>{articulo.intervaloEnDias || 0} días</span>
            </div>
          )}

          {articulo.valorCgi && (
            <div className="flex justify-between">
              <span>Valor CGI:</span>
              <span className="font-medium">${articulo.valorCgi.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Pegados a la parte inferior */}
      <div className="flex justify-between gap-2 pt-4 mt-auto">
        <div className="flex flex-col items-center gap-1 w-16">
          <button
            onClick={() => onCreateOrder(articulo)}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            title="Crear orden de compra"
          >
            <Package size={16} />
          </button>
          <span className="text-xs text-gray-600 font-medium">Comprar</span>
        </div>
        
        <div className="flex flex-col items-center gap-1 w-16">
          <button
            onClick={() => onRegisterSale(articulo)}
            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            title="Registrar venta"
          >
            <ShoppingCart size={16} />
          </button>
          <span className="text-xs text-gray-600 font-medium">Vender</span>
        </div>
        
        <div className="flex flex-col items-center gap-1 w-16">
          <button
            onClick={() => onAdjustStock(articulo)}
            className="p-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors"
            title="Ajustar stock"
          >
            <Settings size={16} />
          </button>
          <span className="text-xs text-gray-600 font-medium">Ajustar</span>
        </div>
        
        <div className="flex flex-col items-center gap-1 w-16">
          <button
            onClick={() => onEdit(articulo)}
            className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
            title="Modificar artículo"
          >
            <Edit size={16} />
          </button>
          <span className="text-xs text-gray-600 font-medium">Editar</span>
        </div>
        
        <div className="flex flex-col items-center gap-1 w-16">
          <button
            onClick={() => onDelete(articulo)}
            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            title="Bajar artículo"
          >
            <Trash2 size={16} />
          </button>
          <span className="text-xs text-gray-600 font-medium">Borrar</span>
        </div>
      </div>
    </div>
  )
}

export default ArticuloCard
