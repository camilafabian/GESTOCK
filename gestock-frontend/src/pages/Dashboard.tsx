"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Articulo, Proveedor } from "../types"
import { articulosApi, proveedoresApi } from "../services/api"
import ArticuloCard from "../components/ArticuloCard"
import CreateOrderModal from "../components/OrderModal"
import RegisterSaleModal from "../components/SaleModal"
import CreateArticuloModal from "../components/ArticuloModal"
import EditArticuloModal from "../components/EditArticuloModal"
import AdjustStockModal from "../components/AdjustStockModal"
import { Plus, Package, AlertTriangle, CheckCircle, RefreshCw, Building } from "lucide-react"

type FilterType = "todos" | "faltantes" | "a-reponer" | "por-proveedor"

const Dashboard: React.FC = () => {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedArticulo, setSelectedArticulo] = useState<Articulo | null>(null)
  const [showCreateOrder, setShowCreateOrder] = useState(false)
  const [showRegisterSale, setShowRegisterSale] = useState(false)
  const [showCreateArticulo, setShowCreateArticulo] = useState(false)
  const [showEditArticulo, setShowEditArticulo] = useState(false)
  const [showAdjustStock, setShowAdjustStock] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [currentFilter, setCurrentFilter] = useState<FilterType>("todos")
  const [selectedProveedor, setSelectedProveedor] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (currentFilter === "por-proveedor" && selectedProveedor) {
      loadArticulosByProveedor(selectedProveedor)
    } else {
      loadArticulos()
    }
  }, [currentFilter, selectedProveedor])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [proveedoresResponse] = await Promise.all([
        proveedoresApi.getAll()
      ])
      
      setProveedores(proveedoresResponse.data)
      loadArticulos()
    } catch (err) {
      setError("Error al cargar los datos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadArticulos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let response
      switch (currentFilter) {
        case "faltantes":
          response = await articulosApi.getFaltantes()
          break
        case "a-reponer":
          response = await articulosApi.getAReponer()
          break
        default:
          response = await articulosApi.getAll()
          break
      }
      
      setArticulos(response.data)
    } catch (err) {
      setError("Error al cargar los artículos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadArticulosByProveedor = async (proveedorId: number) => {
    try {
      setLoading(true)
      setError(null)
      const response = await proveedoresApi.getArticulos(proveedorId)
      setArticulos(response.data)
    } catch (err) {
      setError("Error al cargar artículos del proveedor")
      console.error(err)
      setArticulos([])
    } finally {
      setLoading(false)
    }
  }

  const ordenarArticulos = (articulos: Articulo[]) => {
    return articulos.sort((a, b) => b.codigoArticulo - a.codigoArticulo)
  }

  const articulosOrdenados = ordenarArticulos(articulos)

  const handleCreateOrder = (articulo: Articulo) => {
    setSelectedArticulo(articulo)
    setShowCreateOrder(true)
  }

  const handleRegisterSale = (articulo: Articulo) => {
    setSelectedArticulo(articulo)
    setShowRegisterSale(true)
  }

  const handleEditArticulo = (articulo: Articulo) => {
    setSelectedArticulo(articulo)
    setShowEditArticulo(true)
  }

  const handleAdjustStock = (articulo: Articulo) => {
    setSelectedArticulo(articulo)
    setShowAdjustStock(true)
  }

  const handleDeleteArticulo = (articulo: Articulo) => {
    setSelectedArticulo(articulo)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!selectedArticulo) return

    try {
      setDeleting(true)
      await articulosApi.delete(selectedArticulo.codigoArticulo)
      setShowDeleteConfirm(false)
      setSelectedArticulo(null)
      loadArticulos() // Recargar la lista
    } catch (err: any) {
      console.error("Error al bajar el artículo:", err)
      alert(err.response?.data || "Error al bajar el artículo")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando artículos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Verifica que el backend esté ejecutándose en el puerto 8080 y que la base de datos esté configurada
            correctamente.
          </p>
          <button onClick={loadArticulos} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Artículos</h1>
          <p className="text-gray-600 mt-1">
            {currentFilter === "todos" && `Administra tu inventario de articulos (${articulosOrdenados.length} artículos)`}
            {currentFilter === "faltantes" && `Articulos sin stock disponible (${articulosOrdenados.length} artículos)`}
            {currentFilter === "a-reponer" && `Artículos que requieren reposición (${articulosOrdenados.length} artículos)`}
            {currentFilter === "por-proveedor" && selectedProveedor && (
              `Artículos del proveedor seleccionado (${articulosOrdenados.length} artículos)`
            )}
          </p>
        </div>
        <button
          onClick={() => setShowCreateArticulo(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nuevo Artículo</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setCurrentFilter("todos")
              setSelectedProveedor(null)
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              currentFilter === "todos"
                ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent"
            }`}
          >
            <Package size={16} />
            Todos los Artículos
          </button>
          
          <button
            onClick={() => {
              setCurrentFilter("faltantes")
              setSelectedProveedor(null)
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              currentFilter === "faltantes"
                ? "bg-red-100 text-red-700 border-2 border-red-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent"
            }`}
          >
            <AlertTriangle size={16} />
            Artículos Faltantes
          </button>
          
          <button
            onClick={() => {
              setCurrentFilter("a-reponer")
              setSelectedProveedor(null)
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              currentFilter === "a-reponer"
                ? "bg-orange-100 text-orange-700 border-2 border-orange-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent"
            }`}
          >
            <RefreshCw size={16} />
            Artículos a Reponer
          </button>

          <button
            onClick={() => {
              setCurrentFilter("por-proveedor")
              if (!selectedProveedor) {
                setSelectedProveedor(proveedores.length > 0 ? proveedores[0].codigoProveedor : null)
              }
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              currentFilter === "por-proveedor"
                ? "bg-purple-100 text-purple-700 border-2 border-purple-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent"
            }`}
          >
            <Building size={16} />
            Por Proveedor
          </button>
        </div>

        {/* Selector de proveedor */}
        {currentFilter === "por-proveedor" && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Proveedor:</span>
            <select
              value={selectedProveedor || ""}
              onChange={(e) => setSelectedProveedor(e.target.value ? Number(e.target.value) : null)}
              className="form-select max-w-xs"
            >
              <option value="">Seleccionar proveedor</option>
              {proveedores.map((proveedor) => (
                <option key={proveedor.codigoProveedor} value={proveedor.codigoProveedor}>
                  {proveedor.nombreProveedor}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Articles Grid */}
      {articulosOrdenados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {articulosOrdenados.map((articulo) => (
            <ArticuloCard
              key={articulo.codigoArticulo}
              articulo={articulo}
              onCreateOrder={handleCreateOrder}
              onRegisterSale={handleRegisterSale}
              onEdit={handleEditArticulo}
              onAdjustStock={handleAdjustStock}
              onDelete={handleDeleteArticulo}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {currentFilter === "todos" && "No hay artículos registrados"}
            {currentFilter === "faltantes" && "No hay artículos faltantes"}
            {currentFilter === "a-reponer" && "No hay artículos que requieran reposición"}
            {currentFilter === "por-proveedor" && "No hay artículos para el proveedor seleccionado"}
          </h3>
          <p className="text-gray-500">
            {currentFilter === "todos" && "Comienza agregando tu primer artículo al inventario"}
            {currentFilter === "faltantes" && "Todos los artículos tienen stock disponible"}
            {currentFilter === "a-reponer" && "El inventario está bien abastecido"}
            {currentFilter === "por-proveedor" && "Este proveedor no tiene artículos asociados"}
          </p>
          {currentFilter === "todos" && (
            <button
              onClick={() => setShowCreateArticulo(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Crear Primer Artículo
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateArticulo && (
        <CreateArticuloModal
          onClose={() => setShowCreateArticulo(false)}
          onSuccess={() => {
            setShowCreateArticulo(false)
            loadArticulos()
          }}
        />
      )}

      {showEditArticulo && selectedArticulo && (
        <EditArticuloModal
          articulo={selectedArticulo}
          onClose={() => {
            setShowEditArticulo(false)
            setSelectedArticulo(null)
          }}
          onSuccess={() => {
            setShowEditArticulo(false)
            setSelectedArticulo(null)
            loadArticulos()
          }}
        />
      )}

      {showCreateOrder && selectedArticulo && (
        <CreateOrderModal
          articulo={selectedArticulo}
          onClose={() => {
            setShowCreateOrder(false)
            setSelectedArticulo(null)
          }}
          onSuccess={() => {
            setShowCreateOrder(false)
            setSelectedArticulo(null)
            loadArticulos()
          }}
        />
      )}

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

      {showAdjustStock && selectedArticulo && (
        <AdjustStockModal
          articulo={selectedArticulo}
          onClose={() => {
            setShowAdjustStock(false)
            setSelectedArticulo(null)
          }}
          onSuccess={() => {
            setShowAdjustStock(false)
            setSelectedArticulo(null)
            loadArticulos()
          }}
        />
      )}

      {/* Modal de confirmación de baja */}
      {showDeleteConfirm && selectedArticulo && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h2 className="modal-title">Confirmar Baja</h2>
            </div>
            <div>
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que quieres dar de baja el artículo <strong>"{selectedArticulo.nombreArticulo}"</strong>?
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Esta acción no se puede deshacer. El artículo se marcará como dado de baja y no podrá ser modificado.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setSelectedArticulo(null)
                  }}
                  className="btn btn-secondary"
                  disabled={deleting}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="btn btn-primary bg-red-600 hover:bg-red-700"
                  disabled={deleting}
                >
                  {deleting ? "Bajando..." : "Confirmar Baja"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
