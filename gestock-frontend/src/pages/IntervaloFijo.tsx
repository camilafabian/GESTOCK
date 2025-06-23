"use client";

import type React from "react";
import { useState, useEffect } from "react";
import type { Articulo } from "../types";
import { articulosApi } from "../services/api";
import ArticuloCard from "../components/ArticuloCard";
import CreateOrderModal from "../components/OrderModal";
import RegisterSaleModal from "../components/SaleModal";
import { Package } from "lucide-react";
import EditArticuloModal from "../components/EditArticuloModal";
import AdjustStockModal from "../components/AdjustStockModal";

const IntervaloFijo: React.FC = () => {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticulo, setSelectedArticulo] = useState<Articulo | null>(
    null
  );
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showRegisterSale, setShowRegisterSale] = useState(false);
  const [showEditArticulo, setShowEditArticulo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAdjustStock, setShowAdjustStock] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadArticulos();
  }, []);

  const loadArticulos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articulosApi.getAll();
      // Filtrar solo artículos con modelo "Intervalo Fijo"
      const articulosIntervaloFijo = response.data.filter((articulo) =>
        articulo.modelo?.nombreModelo.toLowerCase().includes("intervalo fijo")
      );
      setArticulos(articulosIntervaloFijo);
    } catch (err) {
      setError("Error al cargar los artículos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = (articulo: Articulo) => {
    setSelectedArticulo(articulo);
    setShowCreateOrder(true);
  };

  const handleRegisterSale = (articulo: Articulo) => {
    setSelectedArticulo(articulo);
    setShowRegisterSale(true);
  };

  const handleEditArticulo = (articulo: Articulo) => {
    setSelectedArticulo(articulo);
    setShowEditArticulo(true);
  };

  const handleDeleteArticulo = (articulo: Articulo) => {
    setSelectedArticulo(articulo);
    setShowDeleteConfirm(true);
  };

  const handleAdjustStock = (articulo: Articulo) => {
    setSelectedArticulo(articulo);
    setShowAdjustStock(true);
  };

  const confirmDelete = async () => {
    if (!selectedArticulo) return;

    try {
      setDeleting(true);
      await articulosApi.delete(selectedArticulo.codigoArticulo);
      setShowDeleteConfirm(false);
      setSelectedArticulo(null);
      loadArticulos(); // Recargar la lista
    } catch (err: any) {
      console.error("Error al bajar el artículo:", err);
      alert(err.response?.data || "Error al bajar el artículo");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="text-lg">
          Cargando artículos con modelo Intervalo Fijo...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="error">{error}</div>
        <div className="text-center">
          <button onClick={loadArticulos} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Modelo Intervalo Fijo
        </h1>
        <p className="text-gray-600 mt-1">
          Artículos gestionados con el modelo de inventario de Intervalo Fijo
        </p>
      </div>

      {/* Info Card */}
      <div className="card bg-yellow-50 border-yellow-200">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-yellow-600 font-bold">IF</span>
          </div>
          <div>
            <h3 className="font-semibold text-yellow-900">
              Modelo Intervalo Fijo
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              En este modelo se realizan pedidos en intervalos de tiempo fijos.
              Se calcula un inventario máximo y se pide la cantidad necesaria
              para alcanzar ese nivel en cada período de revisión.
            </p>
          </div>
        </div>
      </div>

      {/* Articles Count */}
      {articulos.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Mostrando {articulos.length} artículo
            {articulos.length !== 1 ? "s" : ""} con modelo Intervalo Fijo
          </div>
        </div>
      )}

      {/* Articles Grid */}
      {articulos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {articulos.map((articulo) => (
            <ArticuloCard
              key={articulo.codigoArticulo}
              articulo={articulo}
              onCreateOrder={handleCreateOrder}
              onRegisterSale={handleRegisterSale}
              onEdit={handleEditArticulo}
              onDelete={handleDeleteArticulo}
              onAdjustStock={handleAdjustStock}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Package className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay artículos con modelo Intervalo Fijo
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Los artículos aparecerán aquí cuando se configuren con el modelo de
            inventario Intervalo Fijo en el sistema.
          </p>
        </div>
      )}

      {/* Modals */}
      {showCreateOrder && selectedArticulo && (
        <CreateOrderModal
          articulo={selectedArticulo}
          onClose={() => {
            setShowCreateOrder(false);
            setSelectedArticulo(null);
          }}
          onSuccess={() => {
            setShowCreateOrder(false);
            setSelectedArticulo(null);
            loadArticulos();
          }}
        />
      )}

      {showEditArticulo && selectedArticulo && (
        <EditArticuloModal
          articulo={selectedArticulo}
          onClose={() => {
            setShowEditArticulo(false);
            setSelectedArticulo(null);
          }}
          onSuccess={() => {
            setShowEditArticulo(false);
            setSelectedArticulo(null);
            loadArticulos();
          }}
        />
      )}

      {showRegisterSale && selectedArticulo && (
        <RegisterSaleModal
          articulo={selectedArticulo}
          onClose={() => {
            setShowRegisterSale(false);
            setSelectedArticulo(null);
          }}
          onSuccess={() => {
            setShowRegisterSale(false);
            setSelectedArticulo(null);
            loadArticulos();
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
  );
};

export default IntervaloFijo;
