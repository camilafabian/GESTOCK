"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Proveedor, Articulo } from "../types"
import { proveedoresApi, articulosApi } from "../services/api"
import ProveedorCard from "../components/ProveedorCard"
import CreateProveedorModal from "../components/ProveedorModal"
import EditProveedorModal from "../components/EditProveedorModal"
import { Plus, Building, Package, Filter } from "lucide-react"

const Proveedores: React.FC = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateProveedor, setShowCreateProveedor] = useState(false)
  const [showEditProveedor, setShowEditProveedor] = useState(false)
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null)
  const [selectedArticulo, setSelectedArticulo] = useState<number | null>(null)
  const [filteredProveedores, setFilteredProveedores] = useState<Proveedor[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedArticulo) {
      loadProveedoresByArticulo(selectedArticulo)
    } else {
      setFilteredProveedores(proveedores)
    }
  }, [selectedArticulo, proveedores])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [proveedoresResponse, articulosResponse] = await Promise.all([
        proveedoresApi.getAll(),
        articulosApi.getAll()
      ])
      setProveedores(proveedoresResponse.data)
      setFilteredProveedores(proveedoresResponse.data)
      setArticulos(articulosResponse.data)
    } catch (err) {
      setError("Error al cargar los datos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadProveedoresByArticulo = async (articuloId: number) => {
    try {
      const response = await articulosApi.getProveedores(articuloId)
      setFilteredProveedores(response.data)
    } catch (err) {
      console.error("Error al cargar proveedores del artículo:", err)
      setFilteredProveedores([])
    }
  }

  const ordenarProveedores = (proveedores: Proveedor[]) => {
    return proveedores.sort((a, b) => b.codigoProveedor - a.codigoProveedor)
  }

  const proveedoresOrdenados = ordenarProveedores(filteredProveedores)

  const handleEditProveedor = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor)
    setShowEditProveedor(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando proveedores...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
        <div className="text-center">
          <button onClick={loadData} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Proveedores</h1>
          <p className="text-gray-600 mt-1">
            {selectedArticulo 
              ? `Proveedores del artículo seleccionado (${proveedoresOrdenados.length} proveedores)`
              : `Administra tu red de proveedores (${proveedoresOrdenados.length} proveedores)`
            }
          </p>
        </div>
        <button
          onClick={() => setShowCreateProveedor(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      {/* Filtro por Artículo */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filtrar por artículo:</span>
          </div>
          
          <select
            value={selectedArticulo || ""}
            onChange={(e) => setSelectedArticulo(e.target.value ? Number(e.target.value) : null)}
            className="form-select max-w-xs"
          >
            <option value="">Todos</option>
            {articulos.map((articulo) => (
              <option key={articulo.codigoArticulo} value={articulo.codigoArticulo}>
                {articulo.nombreArticulo} (Codigo: {articulo.codigoArticulo})
              </option>
            ))}
          </select>

          {selectedArticulo && (
            <button
              onClick={() => setSelectedArticulo(null)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Limpiar filtro
            </button>
          )}
        </div>
        
        {/* Información del filtro activo */}
        {selectedArticulo && (
          <div className="mt-3 text-sm text-gray-600">
            Mostrando proveedores asociados al artículo seleccionado
          </div>
        )}
      </div>

      {/* Providers Grid */}
      {proveedoresOrdenados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {proveedoresOrdenados.map((proveedor) => (
            <ProveedorCard
              key={proveedor.codigoProveedor}
              proveedor={proveedor}
              onUpdate={loadData}
              onEdit={handleEditProveedor}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Building className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {selectedArticulo 
              ? "No hay proveedores asociados a este artículo"
              : "No hay proveedores registrados"
            }
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {selectedArticulo 
              ? "Este artículo no tiene proveedores asociados. Puedes asociar proveedores desde la gestión de artículos."
              : "Comienza agregando tu primer proveedor. Podrás asociar artículos y gestionar órdenes de compra."
            }
          </p>
          {!selectedArticulo && (
            <button
              onClick={() => setShowCreateProveedor(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2 mx-auto"
            >
              <Plus size={20} />
              <span>Agregar Primer Proveedor</span>
            </button>
          )}
        </div>
      )}

      {/* Create Provider Modal */}
      {showCreateProveedor && (
        <CreateProveedorModal
          onClose={() => setShowCreateProveedor(false)}
          onSuccess={() => {
            setShowCreateProveedor(false)
            loadData()
          }}
        />
      )}

      {/* Edit Provider Modal */}
      {showEditProveedor && selectedProveedor && (
        <EditProveedorModal
          proveedor={selectedProveedor}
          onClose={() => {
            setShowEditProveedor(false)
            setSelectedProveedor(null)
          }}
          onSuccess={() => {
            setShowEditProveedor(false)
            setSelectedProveedor(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}

export default Proveedores
