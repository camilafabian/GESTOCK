"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Articulo, Modelo, Proveedor } from "../types"
import { articulosApi, modelosApi, proveedoresApi } from "../services/api"
import { X } from "lucide-react"

interface EditArticuloModalProps {
  articulo: Articulo
  onClose: () => void
  onSuccess: () => void
}

const EditArticuloModal: React.FC<EditArticuloModalProps> = ({ articulo, onClose, onSuccess }) => {
  const [editedArticulo, setEditedArticulo] = useState<Articulo>({ ...articulo })
  const [modelos, setModelos] = useState<Modelo[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [proveedoresDisponibles, setProveedoresDisponibles] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Cargar proveedores disponibles para este artículo
    loadProveedoresDisponibles()
  }, [articulo.codigoArticulo])

  const loadData = async () => {
    try {
      const [modelosResponse, proveedoresResponse] = await Promise.all([modelosApi.getAll(), proveedoresApi.getAll()])
      setModelos(modelosResponse.data)
      setProveedores(proveedoresResponse.data)
    } catch (err) {
      console.error("Error al cargar datos:", err)
    } finally {
      setLoadingData(false)
    }
  }

  const loadProveedoresDisponibles = async () => {
    try {
      const response = await articulosApi.getProveedores(articulo.codigoArticulo)
      setProveedoresDisponibles(response.data)
    } catch (err) {
      console.error("Error al cargar proveedores disponibles:", err)
      setProveedoresDisponibles([])
    }
  }

  const handleChange = (field: keyof Articulo, value: string | number | Modelo | Proveedor | undefined) => {
    setEditedArticulo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const isIntervaloFijo = editedArticulo.modelo?.nombreModelo.toLowerCase().includes("intervalo fijo")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editedArticulo.nombreArticulo.trim()) {
      setError("El nombre del artículo es requerido")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await articulosApi.update(editedArticulo.codigoArticulo, editedArticulo)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar el artículo")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="loading">
            <div>Cargando datos...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <h2 className="modal-title">Modificar Artículo</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Nombre del Artículo *</label>
              <input
                type="text"
                value={editedArticulo.nombreArticulo}
                onChange={(e) => handleChange("nombreArticulo", e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Modelo</label>
              <select
                value={editedArticulo.modelo?.codigoModelo || ""}
                onChange={(e) => {
                  const modelo = modelos.find((m) => m.codigoModelo === Number(e.target.value))
                  handleChange("modelo", modelo)
                }}
                className="form-select"
              >
                <option value="">Seleccionar modelo</option>
                {modelos.map((modelo) => (
                  <option key={modelo.codigoModelo} value={modelo.codigoModelo}>
                    {modelo.nombreModelo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              value={editedArticulo.descripcionArticulo}
              onChange={(e) => handleChange("descripcionArticulo", e.target.value)}
              className="form-input"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">URL de la Imagen</label>
            <input
              type="url"
              value={editedArticulo.urlImagen || ""}
              onChange={(e) => handleChange("urlImagen", e.target.value)}
              className="form-input"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <div className="text-sm text-gray-500 mt-1">
              Deje vacío para usar la imagen por defecto
            </div>
          </div>

          {/* Parámetros de Inventario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Demanda Anual *</label>
              <input
                type="number"
                value={editedArticulo.demandaArticulo}
                onChange={(e) => handleChange("demandaArticulo", Number(e.target.value))}
                className="form-input"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Costo de Almacenamiento *</label>
              <input
                type="number"
                value={editedArticulo.costoAlmacenamiento}
                onChange={(e) => handleChange("costoAlmacenamiento", Number(e.target.value))}
                className="form-input"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Stock de seguridad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Desviación Estandar</label>
              <input
                type="number"
                value={editedArticulo.desviacionEstandar || ""}
                onChange={(e) => handleChange("desviacionEstandar", Number(e.target.value))}
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nivel de Servicio (%)</label>
              <input
                type="number"
                value={editedArticulo.nivelServicio || ""}
                onChange={(e) => handleChange("nivelServicio", Number(e.target.value))}
                className="form-input"
                min="0"
                max="100"
                step="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Stock Actual</label>
              <input
                type="number"
                value={editedArticulo.stockActual || ""}
                onChange={(e) => handleChange("stockActual", Number(e.target.value))}
                className="form-input"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Máximo *</label>
              <input
                type="number"
                value={editedArticulo.stockMaximo || ""}
                onChange={(e) => handleChange("stockMaximo", Number(e.target.value))}
                className="form-input"
                min="0"
                required
              />
            </div>
          </div>

          {/* Campo específico para modelo de intervalo fijo */}
          {isIntervaloFijo && (
            <div className="form-group">
              <label className="form-label">Intervalo de Días de Reposición *</label>
              <input
                type="number"
                value={editedArticulo.intervaloEnDias || ""}
                onChange={(e) => handleChange("intervaloEnDias", Number(e.target.value))}
                className="form-input"
                min="1"
                max="365"
                required
                placeholder="Ej: 30 días"
              />
              <div className="text-sm text-gray-500 mt-1">
                Número de días entre cada reposición de inventario
              </div>
            </div>
          )}

          {/* Proveedor Predeterminado */}
          <div className="form-group">
            <label className="form-label">Proveedor Predeterminado</label>
            <select
              value={editedArticulo.proveedorPredeterminado?.codigoProveedor || ""}
              onChange={(e) => {
                const proveedor = proveedoresDisponibles.find((p) => p.codigoProveedor === Number(e.target.value))
                handleChange("proveedorPredeterminado", proveedor)
              }}
              className="form-select"
            >
              <option value="">Seleccionar proveedor</option>
              {proveedoresDisponibles.map((proveedor) => (
                <option key={proveedor.codigoProveedor} value={proveedor.codigoProveedor}>
                  {proveedor.nombreProveedor}
                </option>
              ))}
            </select>
            {proveedoresDisponibles.length === 0 && (
              <div className="text-sm text-yellow-600 mt-1">
                No hay proveedores asociados a este artículo. Debe asociar proveedores primero.
              </div>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditArticuloModal
