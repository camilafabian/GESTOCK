"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { OrdenCompraArticulo, Proveedor } from "../types"
import { ordenesCompraApi, proveedoresApi } from "../services/api"
import { X } from "lucide-react"

interface EditOrderModalProps {
  orden: OrdenCompraArticulo
  onClose: () => void
  onSuccess: () => void
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({ orden, onClose, onSuccess }) => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [selectedProveedor, setSelectedProveedor] = useState<number | null>(null)
  const [cantidad, setCantidad] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [orden.nroOrdenCompra])

  const loadData = async () => {
    try {
      setLoading(true)

      // Cargar proveedores del artículo
      const proveedoresResponse = await proveedoresApi.getAll()
      setProveedores(proveedoresResponse.data)

      // Establecer valores actuales
      setSelectedProveedor(orden.articuloProveedor.proveedor.codigoProveedor)
      setCantidad(orden.cantidad)
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

    // Validar stock máximo
    if (orden.articuloProveedor.articulo.stockMaximo) {
      const stockFuturo = (orden.articuloProveedor.articulo.stockActual || 0) + cantidad
      if (stockFuturo > orden.articuloProveedor.articulo.stockMaximo) {
        setError(`La cantidad ingresada superaría el stock máximo. Stock futuro: ${stockFuturo}, Stock máximo: ${orden.articuloProveedor.articulo.stockMaximo}`)
        return
      }
    }

    try {
      setUpdating(true)
      setError(null)

      // Buscar la relación artículo-proveedor seleccionada
      const articuloProveedorSeleccionado = {
        id: {
          articulo: orden.articuloProveedor.articulo.codigoArticulo,
          proveedor: selectedProveedor
        },
        demoraEntrega: 0, // Estos valores se obtendrán del backend
        precioUnitario: 0,
        cargoPedido: 0,
        articulo: orden.articuloProveedor.articulo,
        proveedor: proveedores.find(p => p.codigoProveedor === selectedProveedor)!
      }

      // Crear objeto con los datos actualizados
      const ordenActualizada = {
        cantidad: cantidad,
        articuloProveedor: articuloProveedorSeleccionado,
        estado: orden.estado
      }

      await ordenesCompraApi.update(orden.nroOrdenCompra, ordenActualizada)

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data || "Error al actualizar la orden de compra")
      console.error(err)
    } finally {
      setUpdating(false)
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
          <h2 className="modal-title">Editar Orden de Compra</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        {/* Información del artículo */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-gray-900 mb-2">Artículo de la orden</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              <strong>Código:</strong> {orden.articuloProveedor.articulo.codigoArticulo}
            </div>
            <div>
              <strong>Nombre:</strong> {orden.articuloProveedor.articulo.nombreArticulo}
            </div>
            <div>
              <strong>Stock actual:</strong> {orden.articuloProveedor.articulo.stockActual || 0} unidades
            </div>
            {orden.articuloProveedor.articulo.stockMaximo && (
              <div>
                <strong>Stock máximo:</strong> {orden.articuloProveedor.articulo.stockMaximo} unidades
              </div>
            )}
            {orden.articuloProveedor.articulo.loteOptimo && (
              <div>
                <strong>Lote óptimo:</strong> {orden.articuloProveedor.articulo.loteOptimo} unidades
              </div>
            )}
          </div>
        </div>

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
                  {orden.articuloProveedor.articulo.proveedorPredeterminado?.codigoProveedor === proveedor.codigoProveedor && " (Predeterminado)"}
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
            {orden.articuloProveedor.articulo.loteOptimo && (
              <div className="text-sm text-gray-600 mt-1">
                Lote óptimo: {orden.articuloProveedor.articulo.loteOptimo} unidades
              </div>
            )}
            {orden.articuloProveedor.articulo.stockMaximo && (
              <div className="text-sm text-gray-600 mt-1">
                Stock máximo disponible: {orden.articuloProveedor.articulo.stockMaximo - (orden.articuloProveedor.articulo.stockActual || 0)} unidades
              </div>
            )}
            {orden.articuloProveedor.articulo.stockMaximo && (
              <div className={`text-sm mt-1 ${
                (orden.articuloProveedor.articulo.stockActual || 0) + cantidad > orden.articuloProveedor.articulo.stockMaximo 
                  ? 'text-red-600' 
                  : 'text-green-600'
              }`}>
                Stock futuro: {(orden.articuloProveedor.articulo.stockActual || 0) + cantidad} unidades
                {(orden.articuloProveedor.articulo.stockActual || 0) + cantidad > orden.articuloProveedor.articulo.stockMaximo && 
                  ' (Supera el stock máximo)'}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={updating}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updating || (orden.articuloProveedor.articulo.stockMaximo ? 
                (orden.articuloProveedor.articulo.stockActual || 0) + cantidad > orden.articuloProveedor.articulo.stockMaximo : false)}
            >
              {updating ? "Actualizando..." : "Actualizar Orden"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditOrderModal 