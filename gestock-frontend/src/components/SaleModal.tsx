"use client"

import type React from "react"
import { useState } from "react"
import type { Articulo } from "../types"
import { ventasApi } from "../services/api"
import { X, AlertTriangle } from "lucide-react"

interface SaleModalProps {
  articulo: Articulo
  onClose: () => void
  onSuccess: () => void
}

const SaleModal: React.FC<SaleModalProps> = ({ articulo, onClose, onSuccess }) => {
  const [cantidad, setCantidad] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cantidad <= 0) {
      setError("La cantidad debe ser mayor a 0")
      return
    }

    if (cantidad > (articulo.stockActual || 0)) {
      setError("No hay suficiente stock disponible")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await ventasApi.create({
        fechaVenta: new Date().toISOString().split("T")[0],
        cantidadVenta: cantidad,
        articulo: articulo,
      })

      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al registrar la venta")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const stockInsuficiente = cantidad > (articulo.stockActual || 0)

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Registrar Venta</h2>
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
              <strong>Stock disponible:</strong> {articulo.stockActual || 0} unidades
            </div>
          </div>
        </div>

        {/* Advertencia de stock bajo */}
        {(articulo.stockActual || 0) <= (articulo.stockSeguridad || 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Stock Bajo</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  El stock actual está en el nivel de seguridad o por debajo.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cantidad */}
          <div className="form-group">
            <label className="form-label">Cantidad a vender</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              className={`form-input ${stockInsuficiente ? "border-red-500" : ""}`}
              min="1"
              max={articulo.stockActual || 0}
              required
            />
            <div className="text-sm text-gray-600 mt-1">Stock disponible: {articulo.stockActual || 0} unidades</div>
            {stockInsuficiente && (
              <div className="text-sm text-red-600 mt-1">La cantidad excede el stock disponible</div>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading || stockInsuficiente} className="btn btn-success">
              {loading ? "Registrando..." : "Registrar Venta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SaleModal
