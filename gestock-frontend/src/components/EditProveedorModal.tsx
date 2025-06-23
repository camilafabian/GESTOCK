"use client"

import React, { useState } from "react"
import type { Proveedor, ArticuloProveedorDTO, Articulo, ArticuloProveedor } from "../types"
import { proveedoresApi, articulosApi } from "../services/api"
import { X, Plus, Trash2 } from "lucide-react"

interface EditProveedorModalProps {
  proveedor: Proveedor
  onClose: () => void
  onSuccess: () => void
}

const EditProveedorModal: React.FC<EditProveedorModalProps> = ({ proveedor, onClose, onSuccess }) => {
  const [editedProveedor, setEditedProveedor] = useState<Proveedor>({ ...proveedor })
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [articulosProveedor, setArticulosProveedor] = useState<ArticuloProveedor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [articulosResponse, articulosProveedorResponse] = await Promise.all([
        articulosApi.getAll(),
        proveedoresApi.getArticulosProveedor(proveedor.codigoProveedor),
      ])
      setArticulos(articulosResponse.data)
      setArticulosProveedor(articulosProveedorResponse.data)
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setArticulosProveedor([])
    } finally {
      setLoadingData(false)
    }
  }

  const handleProveedorChange = (field: keyof Proveedor, value: string | number) => {
    setEditedProveedor((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleArticuloProveedorChange = (index: number, field: keyof ArticuloProveedor, value: number) => {
    setArticulosProveedor((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const handleArticuloChange = (index: number, codigoArticulo: number) => {
    const articuloSeleccionado = articulos.find(a => a.codigoArticulo === codigoArticulo)
    setArticulosProveedor((prev) => prev.map((item, i) => 
      i === index 
        ? { 
            ...item, 
            id: { ...item.id, articulo: codigoArticulo },
            articulo: articuloSeleccionado || item.articulo
          } 
        : item
    ))
  }

  const addArticuloProveedor = () => {
    setArticulosProveedor((prev) => [
      ...prev,
      {
        id: { articulo: 0, proveedor: proveedor.codigoProveedor },
        demoraEntrega: 0,
        precioUnitario: 0,
        cargoPedido: 0,
        articulo: {
          codigoArticulo: 0,
          nombreArticulo: "",
          descripcionArticulo: "",
          demandaArticulo: 0,
          costoAlmacenamiento: 0,
        },
        proveedor: proveedor,
      },
    ])
  }

  const getArticulosDisponibles = (currentIndex: number) => {
    const articulosSeleccionados = articulosProveedor
      .map((ap, index) => (index !== currentIndex ? ap.id.articulo : 0))
      .filter((codigo) => codigo > 0)

    return articulos.filter((articulo) => !articulosSeleccionados.includes(articulo.codigoArticulo))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editedProveedor.nombreProveedor.trim()) {
      setError("El nombre del proveedor es requerido")
      return
    }

    const articulosValidos = articulosProveedor.filter(
      (ap) => ap.id.articulo > 0 && ap.demoraEntrega > 0 && ap.precioUnitario > 0 && ap.cargoPedido >= 0,
    )

    // Verificar duplicados
    const codigosArticulos = articulosValidos.map((ap) => ap.id.articulo)
    const duplicados = codigosArticulos.filter((codigo, index) => codigosArticulos.indexOf(codigo) !== index)
    if (duplicados.length > 0) {
      setError("No se pueden agregar artículos duplicados")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await proveedoresApi.update(editedProveedor.codigoProveedor, editedProveedor)
      
      // Convertir ArticuloProveedor a ArticuloProveedorDTO para el endpoint
      const articulosDTO: ArticuloProveedorDTO[] = articulosValidos.map(ap => ({
        codigoArticulo: ap.id.articulo,
        demoraEntrega: ap.demoraEntrega,
        precioUnitario: ap.precioUnitario,
        cargoPedido: ap.cargoPedido,
      }))

      if (articulosDTO.length > 0) {
        await proveedoresApi.addArticulos(editedProveedor.codigoProveedor, articulosDTO)
      }

      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar el proveedor")
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
          <h2 className="modal-title">Editar Proveedor</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Proveedor */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Información del Proveedor</h3>

            <div className="form-group">
              <label className="form-label">Código</label>
              <input type="text" value={editedProveedor.codigoProveedor} className="form-input bg-gray-100" disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Nombre del Proveedor *</label>
              <input
                type="text"
                value={editedProveedor.nombreProveedor}
                onChange={(e) => handleProveedorChange("nombreProveedor", e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dirección *</label>
              <input
                type="text"
                value={editedProveedor.direccionProveedor}
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
                  value={editedProveedor.telefonoProveedor || ""}
                  onChange={(e) => handleProveedorChange("telefonoProveedor", Number(e.target.value))}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  value={editedProveedor.emailProveedor}
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
              <h3 className="font-medium text-gray-900">Artículos Asociados</h3>
              <button type="button" onClick={addArticuloProveedor} className="btn btn-secondary">
                <Plus size={16} />
                Agregar Artículo
              </button>
            </div>

            <div className="space-y-4">
              {articulosProveedor.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay artículos asociados a este proveedor.</p>
                  <p className="text-sm mt-1">Haz clic en "Agregar Artículo" para comenzar.</p>
                </div>
              ) : (
                articulosProveedor.map((ap, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-sm">
                        Artículo {index + 1}
                        {ap.articulo.nombreArticulo && (
                          <span className="text-gray-500 ml-2">- {ap.articulo.nombreArticulo}</span>
                        )}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="form-label">Artículo</label>
                        <select
                          value={ap.id.articulo}
                          onChange={(e) => handleArticuloChange(index, Number(e.target.value))}
                          className="form-select"
                          required
                        >
                          <option value={0}>Seleccionar artículo</option>
                          {getArticulosDisponibles(index).map((articulo) => (
                            <option key={articulo.codigoArticulo} value={articulo.codigoArticulo}>
                              {articulo.codigoArticulo} - {articulo.nombreArticulo}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Demora Entrega (días)</label>
                        <input
                          type="number"
                          value={ap.demoraEntrega}
                          onChange={(e) => handleArticuloProveedorChange(index, "demoraEntrega", Number(e.target.value))}
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
                          onChange={(e) => handleArticuloProveedorChange(index, "precioUnitario", Number(e.target.value))}
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
                ))
              )}
            </div>
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

export default EditProveedorModal
