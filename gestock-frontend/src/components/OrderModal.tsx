"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Articulo, Proveedor } from "../types"
import { ordenesCompraApi, proveedoresApi } from "../services/api"
import { X } from "lucide-react"

interface OrderModalProps {
  articulo: Articulo
  onClose: () => void
  onSuccess: () => void
}

const OrderModal: React.FC<OrderModalProps> = ({ articulo, onClose, onSuccess }) => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [selectedProveedor, setSelectedProveedor] = useState<number | null>(null)
  const [cantidad, setCantidad] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tieneOCActiva, setTieneOCActiva] = useState<boolean>(false)
  const [forzarCreacion, setForzarCreacion] = useState<boolean>(false)

  useEffect(() => {
    loadData()
  }, [articulo.codigoArticulo])

  const loadData = async () => {
    try {
      setLoading(true)

      // Verificar si hay una orden activa
      const ocActivaResponse = await ordenesCompraApi.tieneOCActiva(articulo.codigoArticulo)
      setTieneOCActiva(ocActivaResponse.data)

      // Cargar proveedores del artículo
      const proveedoresResponse = await proveedoresApi.getAll()
      setProveedores(proveedoresResponse.data)

      // Establecer valores por defecto
      if (articulo.proveedorPredeterminado) {
        setSelectedProveedor(articulo.proveedorPredeterminado.codigoProveedor)
      }
      setCantidad(articulo.loteOptimo || 0)
    } catch (err) {
      setError("Error al cargar los datos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProveedor || cantidad <= 0) {
      setError("Por favor complete todos los campos requeridos")
      return
    }

    if (tieneOCActiva && !forzarCreacion) {
      setError("Debe confirmar que desea crear una nueva orden de compra cuando ya existe una activa")
      return
    }

    try {
      setCreating(true)
      setError(null)

      await ordenesCompraApi.createNew(
        articulo.codigoArticulo,
        selectedProveedor,
        cantidad,
        forzarCreacion,
        false
      )

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data || "Error al crear la orden de compra")
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Cargando...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Crear Orden de Compra</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        {/* Información del artículo */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-gray-900 mb-2">Artículo seleccionado</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              <strong>Código:</strong> {articulo.codigoArticulo}
            </div>
            <div>
              <strong>Nombre:</strong> {articulo.nombreArticulo}
            </div>
            <div>
              <strong>Stock actual:</strong> {articulo.stockActual || 0} unidades
            </div>
            {articulo.puntoPedido && (
              <div>
                <strong>Punto de pedido:</strong> {articulo.puntoPedido} unidades
              </div>
            )}
            {articulo.loteOptimo && (
              <div>
                <strong>Lote óptimo:</strong> {articulo.loteOptimo} unidades
              </div>
            )}
          </div>
        </div>

        {/* Alerta de orden activa */}
        {tieneOCActiva && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">
                  Orden de compra activa detectada
                </h3>
                <div className="mt-2 text-sm text-orange-700">
                  <p>Este artículo ya tiene una orden de compra activa. Si continúa, se creará una nueva orden.</p>
                </div>
                <div className="mt-3">
                  <div className="flex items-center">
                    <input
                      id="forzar-creacion"
                      type="checkbox"
                      checked={forzarCreacion}
                      onChange={(e) => setForzarCreacion(e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="forzar-creacion" className="ml-2 text-sm text-orange-800">
                      Entiendo y deseo crear una nueva orden de compra
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Proveedor */}
          <div className="form-group">
            <label className="form-label">Proveedor</label>
            <select
              value={selectedProveedor || ""}
              onChange={(e) => setSelectedProveedor(Number(e.target.value))}
              className="form-select"
              required
            >
              <option value="">Seleccionar proveedor</option>
              {proveedores.map((proveedor) => (
                <option key={proveedor.codigoProveedor} value={proveedor.codigoProveedor}>
                  {proveedor.nombreProveedor}
                  {articulo.proveedorPredeterminado?.codigoProveedor === proveedor.codigoProveedor && " (Predeterminado)"}
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad */}
          <div className="form-group">
            <label className="form-label">Cantidad</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              className="form-input"
              min="1"
              required
            />
            {articulo.loteOptimo && (
              <div className="text-sm text-gray-600 mt-1">
                Lote óptimo: {articulo.loteOptimo} unidades
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={creating}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating || (tieneOCActiva && !forzarCreacion)}
            >
              {creating ? "Creando..." : "Crear Orden"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OrderModal
