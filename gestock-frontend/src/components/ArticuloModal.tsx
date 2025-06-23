"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Articulo, Modelo } from "../types"
import { articulosApi, modelosApi } from "../services/api"
import { X } from "lucide-react"

interface ArticuloModalProps {
  onClose: () => void
  onSuccess: () => void
}

const ArticuloModal: React.FC<ArticuloModalProps> = ({ onClose, onSuccess }) => {
  const [articulo, setArticulo] = useState<Omit<Articulo, "codigoArticulo">>({
    nombreArticulo: "",
    descripcionArticulo: "",
    demandaArticulo: 0,
    costoAlmacenamiento: 0,
    stockActual: 0,
    stockMaximo: 0,
    desviacionEstandar: 0,
    nivelServicio: 0,
    urlImagen: "",
    intervaloEnDias: 0,
  })

  const [modelos, setModelos] = useState<Modelo[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const modelosResponse = await modelosApi.getAll()
      setModelos(modelosResponse.data)
    } catch (err) {
      console.error("Error al cargar datos:", err)
    } finally {
      setLoadingData(false)
    }
  }

  const handleChange = (field: keyof typeof articulo, value: string | number | Modelo | undefined) => {
    setArticulo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const isIntervaloFijo = articulo.modelo?.nombreModelo.toLowerCase().includes("intervalo fijo")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!articulo.nombreArticulo.trim()) {
      setError("El nombre del artículo es requerido")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await articulosApi.create(articulo)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear el artículo")
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
          <h2 className="modal-title">Crear Nuevo Artículo</h2>
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
                value={articulo.nombreArticulo}
                onChange={(e) => handleChange("nombreArticulo", e.target.value)}
                className="form-input"
                placeholder="Ej: Samsung Galaxy S24"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Modelo</label>
              <select
                value={articulo.modelo?.codigoModelo || ""}
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
              value={articulo.descripcionArticulo}
              onChange={(e) => handleChange("descripcionArticulo", e.target.value)}
              className="form-input"
              rows={3}
              placeholder="Descripción detallada del artículo"
            />
          </div>

          <div className="form-group">
            <label className="form-label">URL de la Imagen</label>
            <input
              type="url"
              value={articulo.urlImagen || ""}
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
                value={articulo.demandaArticulo}
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
                value={articulo.costoAlmacenamiento}
                onChange={(e) => handleChange("costoAlmacenamiento", Number(e.target.value))}
                className="form-input"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Stock de seguridad*/}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Desviación Estandar *</label>
              <input
                type="number"
                value={articulo.desviacionEstandar || ""}
                onChange={(e) => handleChange("desviacionEstandar", Number(e.target.value))}
                className="form-input"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nivel de Servicio (%) *</label>
              <input
                type="number"
                value={articulo.nivelServicio || ""}
                onChange={(e) => handleChange("nivelServicio", Number(e.target.value))}
                className="form-input"
                min="0"
                max="100"
                step="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Stock Actual</label>
              <input
                type="number"
                value={articulo.stockActual || ""}
                onChange={(e) => handleChange("stockActual", Number(e.target.value))}
                className="form-input"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Máximo *</label>
              <input
                type="number"
                value={articulo.stockMaximo || ""}
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
                value={articulo.intervaloEnDias || ""}
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

          {error && <div className="error">{error}</div>}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Creando..." : "Crear Artículo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ArticuloModal
