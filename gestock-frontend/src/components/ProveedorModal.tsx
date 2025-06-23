"use client"

import React, { useState } from "react"
import type { Proveedor, ArticuloProveedorDTO, Articulo } from "../types"
import { proveedoresApi, articulosApi } from "../services/api"
import { X, Plus, Trash2 } from "lucide-react"

interface CreateProveedorModalProps {
  onClose: () => void
  onSuccess: () => void
}

const CreateProveedorModal: React.FC<CreateProveedorModalProps> = ({ onClose, onSuccess }) => {
  const [proveedor, setProveedor] = useState<Omit<Proveedor, "codigoProveedor">>({
    nombreProveedor: "",
    direccionProveedor: "",
    telefonoProveedor: 0,
    emailProveedor: "",
  })

  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [articulosProveedor, setArticulosProveedor] = useState<ArticuloProveedorDTO[]>([
    {
      codigoArticulo: 0,
      demoraEntrega: 0,
      precioUnitario: 0,
      cargoPedido: 0,
    },
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingArticulos, setLoadingArticulos] = useState(true)

  React.useEffect(() => {
    loadArticulos()
  }, [])

  const loadArticulos = async () => {
    try {
      const response = await articulosApi.getAll()
      setArticulos(response.data)
    } catch (err) {
      console.error("Error al cargar artículos:", err)
    } finally {
      setLoadingArticulos(false)
    }
  }

  const handleProveedorChange = (field: keyof typeof proveedor, value: string | number) => {
    setProveedor((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleArticuloProveedorChange = (index: number, field: keyof ArticuloProveedorDTO, value: number) => {
    setArticulosProveedor((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const addArticuloProveedor = () => {
    setArticulosProveedor((prev) => [
      ...prev,
      {
        codigoArticulo: 0,
        demoraEntrega: 0,
        precioUnitario: 0,
        cargoPedido: 0,
      },
    ])
  }

  const removeArticuloProveedor = (index: number) => {
    if (articulosProveedor.length > 1) {
      setArticulosProveedor((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const getArticulosDisponibles = (currentIndex: number) => {
    const articulosSeleccionados = articulosProveedor
      .map((ap, index) => (index !== currentIndex ? ap.codigoArticulo : 0))
      .filter((codigo) => codigo > 0)

    return articulos.filter((articulo) => !articulosSeleccionados.includes(articulo.codigoArticulo))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!proveedor.nombreProveedor.trim()) {
      setError("El nombre del proveedor es requerido")
      return
    }

    const articulosValidos = articulosProveedor.filter(
      (ap) => ap.codigoArticulo > 0 && ap.demoraEntrega > 0 && ap.precioUnitario > 0 && ap.cargoPedido >= 0,
    )

    if (articulosValidos.length === 0) {
      setError("Debe asociar al menos un artículo válido al proveedor")
      return
    }

    // Verificar duplicados
    const codigosArticulos = articulosValidos.map((ap) => ap.codigoArticulo)
    const duplicados = codigosArticulos.filter((codigo, index) => codigosArticulos.indexOf(codigo) !== index)
    if (duplicados.length > 0) {
      setError("No se pueden agregar artículos duplicados")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await proveedoresApi.createWithArticulos({
        proveedor,
        articulos: articulosValidos,
      })

      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear el proveedor")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <h2 className="modal-title">Crear Nuevo Proveedor</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Proveedor */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Información del Proveedor</h3>

            <div className="form-group">
              <label className="form-label">Nombre del Proveedor *</label>
              <input
                type="text"
                value={proveedor.nombreProveedor}
                onChange={(e) => handleProveedorChange("nombreProveedor", e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dirección *</label>
              <input
                type="text"
                value={proveedor.direccionProveedor}
                onChange={(e) => handleProveedorChange("direccionProveedor", e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Teléfono *</label>
                <input
                  type="number"
                  value={proveedor.telefonoProveedor || ""}
                  onChange={(e) => handleProveedorChange("telefonoProveedor", Number(e.target.value))}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  value={proveedor.emailProveedor}
                  onChange={(e) => handleProveedorChange("emailProveedor", e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Artículos Asociados */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Artículos Asociados *</h3>
              <button type="button" onClick={addArticuloProveedor} className="btn btn-secondary">
                <Plus size={16} />
                Agregar Artículo
              </button>
            </div>

            {loadingArticulos ? (
              <div className="text-center py-4">Cargando artículos...</div>
            ) : (
              <div className="space-y-4">
                {articulosProveedor.map((ap, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-sm">Artículo {index + 1}</h4>
                      {articulosProveedor.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArticuloProveedor(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="form-label">Artículo</label>
                        <select
                          value={ap.codigoArticulo}
                          onChange={(e) =>
                            handleArticuloProveedorChange(index, "codigoArticulo", Number(e.target.value))
                          }
                          className="form-select"
                          required
                        >
                          <option value={0}>Seleccionar artículo</option>
                          {getArticulosDisponibles(index).map((articulo) => (
                            <option key={articulo.codigoArticulo} value={articulo.codigoArticulo}>
                              {articulo.nombreArticulo}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Demora Entrega (días)</label>
                        <input
                          type="number"
                          value={ap.demoraEntrega}
                          onChange={(e) =>
                            handleArticuloProveedorChange(index, "demoraEntrega", Number(e.target.value))
                          }
                          className="form-input"
                          min="0"
                          step="0.1"
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label">Precio Unitario</label>
                        <input
                          type="number"
                          value={ap.precioUnitario}
                          onChange={(e) =>
                            handleArticuloProveedorChange(index, "precioUnitario", Number(e.target.value))
                          }
                          className="form-input"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="form-label">Cargo por Pedido</label>
                        <input
                          type="number"
                          value={ap.cargoPedido}
                          onChange={(e) => handleArticuloProveedorChange(index, "cargoPedido", Number(e.target.value))}
                          className="form-input"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading || loadingArticulos} className="btn btn-primary">
              {loading ? "Creando..." : "Crear Proveedor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProveedorModal
