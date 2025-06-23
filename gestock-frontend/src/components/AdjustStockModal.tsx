"use client"

import type React from "react"
import { useState } from "react"
import type { Articulo } from "../types"
import { articulosApi } from "../services/api"
import { X, Plus, Minus } from "lucide-react"

interface AdjustStockModalProps {
  articulo: Articulo
  onClose: () => void
  onSuccess: () => void
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({ articulo, onClose, onSuccess }) => {
  const [adjustment, setAdjustment] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (adjustment === 0) {
      setError("El ajuste debe ser diferente de 0")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Calcular el nuevo stock
      const newStock = (articulo.stockActual || 0) + adjustment
      
      if (newStock < 0) {
        setError("El stock no puede ser negativo")
        return
      }

      if (articulo.stockMaximo && newStock > articulo.stockMaximo) {
        setError(`El stock no puede ser mayor al stock máximo (${articulo.stockMaximo})`)
        return
      }

      // Actualizar el artículo con el nuevo stock
      await articulosApi.update(articulo.codigoArticulo, {
        ...articulo,
        stockActual: newStock
      })

      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al ajustar el stock")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAdjust = (amount: number) => {
    setAdjustment(adjustment + amount)
  }

  const getNewStock = () => {
    return (articulo.stockActual || 0) + adjustment
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: "500px" }}>
        <div className="modal-header">
          <h2 className="modal-title">Ajustar Stock</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información del artículo */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">{articulo.nombreArticulo}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Código: {articulo.codigoArticulo}</div>
              <div>Stock actual: <span className="font-medium">{articulo.stockActual || 0} unidades</span></div>
              <div>Stock máximo: {articulo.stockMaximo || 0} unidades</div>
            </div>
          </div>

          {/* Ajuste manual */}
          <div className="form-group">
            <label className="form-label">Ajuste de stock</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleQuickAdjust(-1)}
                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                title="Disminuir 1"
              >
                <Minus size={16} />
              </button>
              
              <input
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(Number(e.target.value))}
                className="form-input text-center flex-1"
                placeholder="0"
                step="1"
              />
              
              <button
                type="button"
                onClick={() => handleQuickAdjust(1)}
                className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                title="Aumentar 1"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Botones de ajuste rápido */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickAdjust(-5)}
              className="py-2 px-3 bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 transition-colors text-sm"
            >
              -5 unidades
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdjust(5)}
              className="py-2 px-3 bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100 transition-colors text-sm"
            >
              +5 unidades
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdjust(-10)}
              className="py-2 px-3 bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 transition-colors text-sm"
            >
              -10 unidades
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdjust(10)}
              className="py-2 px-3 bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100 transition-colors text-sm"
            >
              +10 unidades
            </button>
          </div>

          {/* Vista previa del resultado */}
          {adjustment !== 0 && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <div className="font-medium">Stock después del ajuste:</div>
                <div className="text-lg font-bold">
                  {getNewStock()} unidades
                  <span className={`ml-2 text-sm ${adjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ({adjustment > 0 ? '+' : ''}{adjustment})
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && <div className="error">{error}</div>}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading || adjustment === 0} 
              className="btn btn-primary"
            >
              {loading ? "Ajustando..." : "Confirmar Ajuste"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdjustStockModal 