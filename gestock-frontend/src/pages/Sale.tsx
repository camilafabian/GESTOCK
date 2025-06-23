"use client"

import React, { useState } from "react"
import type { Articulo } from "../types"
import { articulosApi } from "../services/api"
import RegisterSaleModal from "../components/SaleModal"
import { Search, DollarSign, TrendingUp, Package } from "lucide-react"

const Ventas: React.FC = () => {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [filteredArticulos, setFilteredArticulos] = useState<Articulo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedArticulo, setSelectedArticulo] = useState<Articulo | null>(null)
  const [showRegisterSale, setShowRegisterSale] = useState(false)

  React.useEffect(() => {
    loadArticulos()
  }, [])

  React.useEffect(() => {
    filterArticulos()
  }, [searchQuery, articulos])

  const loadArticulos = async () => {
    try {
      setLoading(true)
      const response = await articulosApi.getAll()
      setArticulos(response.data)
    } catch (err) {
      setError("Error al cargar los artículos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filterArticulos = () => {
    if (!searchQuery.trim()) {
      setFilteredArticulos(articulos)
      return
    }

    const filtered = articulos.filter(
      (articulo) =>
        articulo.nombreArticulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        articulo.descripcionArticulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        articulo.codigoArticulo.toString().includes(searchQuery),
    )
    setFilteredArticulos(filtered)
  }

  const handleRegisterSale = (articulo: Articulo) => {
    setSelectedArticulo(articulo)
    setShowRegisterSale(true)
  }

  const getStockStatus = (articulo: Articulo) => {
    if (!articulo.stockActual) return "sin-stock"
    if (articulo.stockSeguridad && articulo.stockActual <= articulo.stockSeguridad) return "critico"
    if (articulo.puntoPedido && articulo.stockActual <= articulo.puntoPedido) return "bajo"
    return "normal"
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "sin-stock":
        return "text-red-600 bg-red-50"
      case "critico":
        return "text-red-600 bg-red-50"
      case "bajo":
        return "text-yellow-600 bg-yellow-50"
      case "normal":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="text-lg">Cargando artículos...</div>
      </div>
    )
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Ventas</h1>
        <p className="text-gray-600 mt-1">Registra las ventas de productos</p>
      </div>

      {/* Articles Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Artículo</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Código</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticulos.map((articulo) => {
                const stockStatus = getStockStatus(articulo)
                const stockColorClass = getStockStatusColor(stockStatus)

                return (
                  <tr key={articulo.codigoArticulo} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{articulo.nombreArticulo}</div>
                        <div className="text-sm text-gray-600 line-clamp-1">{articulo.descripcionArticulo}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{articulo.codigoArticulo}</td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">{articulo.stockActual || 0} unidades</span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockColorClass}`}
                      >
                        {stockStatus === "sin-stock" && "Sin Stock"}
                        {stockStatus === "critico" && "Stock Crítico"}
                        {stockStatus === "bajo" && "Stock Bajo"}
                        {stockStatus === "normal" && "Stock Normal"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleRegisterSale(articulo)}
                        disabled={(articulo.stockActual || 0) === 0}
                        className={`btn ${(articulo.stockActual || 0) === 0 ? "btn-secondary opacity-50 cursor-not-allowed" : "btn-success"}`}
                      >
                        <DollarSign size={16} />
                        Registrar Venta
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredArticulos.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 text-lg">
                {searchQuery ? "No se encontraron artículos" : "No hay artículos disponibles"}
              </div>
              <p className="text-gray-400 mt-2">
                {searchQuery
                  ? "Intenta con otros términos de búsqueda"
                  : "Los artículos aparecerán aquí cuando se agreguen al sistema"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Register Sale Modal */}
      {showRegisterSale && selectedArticulo && (
        <RegisterSaleModal
          articulo={selectedArticulo}
          onClose={() => {
            setShowRegisterSale(false)
            setSelectedArticulo(null)
          }}
          onSuccess={() => {
            setShowRegisterSale(false)
            setSelectedArticulo(null)
            loadArticulos()
          }}
        />
      )}
    </div>
  )
}

export default Ventas
