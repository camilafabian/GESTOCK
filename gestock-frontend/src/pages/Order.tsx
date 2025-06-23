"use client";

import type React from "react";
import { useState, useEffect } from "react";
import type { OrdenCompraArticulo, EstadoOrdenCompra } from "../types";
import { ordenesCompraApi, estadosApi } from "../services/api";
import EditOrderModal from "../components/EditOrderModal";
import { Delete, Edit, Package, Send } from "lucide-react";

const Compras: React.FC = () => {
  const [ordenes, setOrdenes] = useState<OrdenCompraArticulo[]>([]);
  const [estados, setEstados] = useState<EstadoOrdenCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [showEditOrder, setShowEditOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<OrdenCompraArticulo | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordenesResponse, estadosResponse] = await Promise.all([
        ordenesCompraApi.getAll(),
        estadosApi.getAll(),
      ]);

      // Filtrar las que tienen fechaHoraBajaOC != null
      const ordenesConFechaBaja = ordenesResponse.data.filter(
        (orden: OrdenCompraArticulo) => orden.fechaHoraBajaOC == null
      );

      setOrdenes(ordenesConFechaBaja);
      setEstados(estadosResponse.data);
    } catch (err) {
      setError("Error al cargar las órdenes de compra");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getModeloBadgeClass = (modelo?: string) => {
    if (!modelo) return "bg-green-100 text-green-800";
    return modelo.toLowerCase().includes("lote")
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const handleEnviarOrden = async (id: number) => {
    // Buscar la orden específica
    const orden = ordenes.find((o) => o.nroOrdenCompra === id);
    if (!orden) {
      alert("Orden no encontrada");
      return;
    }

    // Validar stock máximo antes de enviar
    if (orden.articuloProveedor.articulo.stockMaximo) {
      const stockFuturo =
        (orden.articuloProveedor.articulo.stockActual || 0) + orden.cantidad;
      if (stockFuturo > orden.articuloProveedor.articulo.stockMaximo) {
        alert(
          `No se puede enviar la orden. El stock resultante (${stockFuturo}) superaría el stock máximo permitido (${orden.articuloProveedor.articulo.stockMaximo}).`
        );
        return;
      }
    }

    try {
      await ordenesCompraApi.enviar(id);
      loadData();
    } catch (err: any) {
      console.error("Error al enviar la orden:", err);
      const errorMessage = err.response?.data || "Error al enviar la orden";
      alert(errorMessage);
    }
  };

  const handleFinalizarOrden = async (id: number) => {
    try {
      await ordenesCompraApi.finalizar(id);
      loadData();
    } catch (err) {
      console.error("Error al finalizar la orden:", err);
      loadData();
    }
  };

  const handleCancelarOrden = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta orden?")) {
      return;
    }

    try {
      await ordenesCompraApi.cancel(id);
      loadData();
    } catch (err) {
      console.error("Error al cancelar la orden:", err);
      alert("Error al cancelar la orden");
    }
  };

  const handleEditOrder = (orden: OrdenCompraArticulo) => {
    setSelectedOrder(orden);
    setShowEditOrder(true);
  };

  const superaStockMaximo = (orden: OrdenCompraArticulo) => {
    if (!orden.articuloProveedor.articulo.stockMaximo) return false;
    const stockFuturo =
      (orden.articuloProveedor.articulo.stockActual || 0) + orden.cantidad;
    return stockFuturo > orden.articuloProveedor.articulo.stockMaximo;
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return "bg-yellow-500 text-white";
      case "enviada":
        return "bg-blue-500 text-white";
      case "finalizada":
        return "bg-green-500 text-white";
      case "cancelada":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getEstadoPrioridad = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return 1;
      case "enviada":
        return 2;
      case "finalizada":
        return 3;
      case "cancelada":
        return 4;
      default:
        return 5;
    }
  };

  const ordenarOrdenes = (ordenes: OrdenCompraArticulo[]) => {
    return ordenes.sort((a, b) => {
      const prioridadA = getEstadoPrioridad(a.estado.nombreEstado);
      const prioridadB = getEstadoPrioridad(b.estado.nombreEstado);

      // Primero ordenar por prioridad de estado
      if (prioridadA !== prioridadB) {
        return prioridadA - prioridadB;
      }

      // Si tienen la misma prioridad, ordenar por código de orden (mayor primero)
      return b.nroOrdenCompra - a.nroOrdenCompra;
    });
  };

  const ordenesFiltradas = ordenarOrdenes(
    filtroEstado === "todos"
      ? ordenes
      : ordenes.filter(
          (orden) => orden.estado.nombreEstado.toLowerCase() === filtroEstado
        )
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando órdenes de compra...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Compras</h1>
        <p className="text-gray-600 mt-1">Administra las órdenes de compra</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <label className="font-medium text-gray-700">
            Filtrar por estado:
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos los estados</option>
            {estados.map((estado) => (
              <option
                key={estado.codigoEoc}
                value={estado.nombreEstado.toLowerCase()}
              >
                {estado.nombreEstado}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Órdenes de Compra Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {ordenesFiltradas.length > 0 ? (
          ordenesFiltradas.map((orden) => (
            <div
              key={orden.nroOrdenCompra}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-3"
            >
              {/* Header with order number and status */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    ORDEN DE COMPRA N° {orden.nroOrdenCompra}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getModeloBadgeClass(
                        orden.articuloProveedor.articulo.modelo?.nombreModelo
                      )}`}
                    >
                      {orden.articuloProveedor.articulo.modelo?.nombreModelo}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getEstadoBadgeClass(
                        orden.estado.nombreEstado
                      )}`}
                    >
                      {orden.estado.nombreEstado.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Image */}
              <div className="flex justify-center mb-4">
                <div className="w-30 h-36 bg-gray-50 rounded-lg border overflow-hidden flex items-center justify-center">
                  {orden.articuloProveedor.articulo.urlImagen ? (
                    // Imagen personalizada
                    <img
                      src={orden.articuloProveedor.articulo.urlImagen}
                      alt={orden.articuloProveedor.articulo.nombreArticulo}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Si la imagen falla, mostrar la imagen por defecto
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}

                  {/* Imagen por defecto (phone mockup) */}
                  <div
                    className={`w-12 h-20 bg-gray-800 rounded-lg relative ${
                      orden.articuloProveedor.articulo.urlImagen ? "hidden" : ""
                    }`}
                  >
                    <div className="w-8 h-16 bg-white rounded-md absolute top-1 left-1 flex items-center justify-center">
                      <div className="w-6 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <Package className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium">Artículo:</span>{" "}
                  {orden.articuloProveedor.articulo.nombreArticulo}
                </div>
                <div>
                  <span className="font-medium">Proveedor:</span>{" "}
                  {orden.articuloProveedor.proveedor.nombreProveedor}
                </div>
                <div>
                  <span className="font-medium">Fecha de Creación:</span>{" "}
                  {new Date(orden.fechaHoraCompra).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Tipo de Creación:</span>{" "}
                  {orden.esAutomatica ? "AUTOMÁTICA" : "MANUAL"}
                </div>
                <div>
                  <span className="font-medium">Cantidad:</span>{" "}
                  {orden.cantidad}
                </div>
                <div>
                  <span className="font-medium">Costo de Pedido:</span> $
                  {orden.montoTotal.toFixed(2)}
                </div>
                {orden.estado.nombreEstado.toLowerCase() === "pendiente" &&
                  orden.articuloProveedor.articulo.stockMaximo && (
                    <div
                      className={`text-xs ${
                        superaStockMaximo(orden)
                          ? "text-red-600 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      <span className="font-medium">Stock futuro:</span>{" "}
                      {(orden.articuloProveedor.articulo.stockActual || 0) +
                        orden.cantidad}{" "}
                      / {orden.articuloProveedor.articulo.stockMaximo}
                      {superaStockMaximo(orden) && " (EXCEDE MÁXIMO)"}
                    </div>
                  )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2 flex justify-around w-full">
                {orden.estado.nombreEstado.toLowerCase() === "pendiente" && (
                  <>
                    <div className="flex flex-col items-center gap-1 w-16">
                      <button
                        onClick={() => handleEnviarOrden(orden.nroOrdenCompra)}
                        disabled={superaStockMaximo(orden)}
                        className={`mt-2 p-2 rounded-full transition-colors ${
                          superaStockMaximo(orden)
                            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                            : "bg-violet-600 text-white hover:bg-blue-700"
                        }`}
                        title={
                          superaStockMaximo(orden)
                            ? `No se puede enviar. Stock futuro (${
                                (orden.articuloProveedor.articulo.stockActual ||
                                  0) + orden.cantidad
                              }) superaría el máximo (${
                                orden.articuloProveedor.articulo.stockMaximo
                              })`
                            : "Enviar Compra"
                        }
                      >
                        <Send size={16} />
                      </button>
                      <span className="text-xs text-gray-600 font-medium text-center">
                        {superaStockMaximo(orden)
                          ? "Stock máximo excedido"
                          : "Enviar"}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1 w-16">
                      <button
                        onClick={() => handleEditOrder(orden)}
                        className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                        title="Modificar Compra"
                      >
                        <Edit size={16} />
                      </button>
                      <span className="text-xs text-gray-600 font-medium">
                        Editar
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1 w-16">
                      <button
                        onClick={() =>
                          handleCancelarOrden(orden.nroOrdenCompra)
                        }
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                        title="Modificar artículo"
                      >
                        <Delete size={16} />
                      </button>
                      <span className="text-xs text-gray-600 font-medium">
                        Eliminar
                      </span>
                    </div>
                  </>
                )}

                {orden.estado.nombreEstado.toLowerCase() === "enviada" && (
                  <button
                    onClick={() => handleFinalizarOrden(orden.nroOrdenCompra)}
                    className="w-full py-2 px-3 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                  >
                    Finalizar orden de compra
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 text-lg">
              No hay órdenes de compra
              {filtroEstado !== "todos" && ` con estado "${filtroEstado}"`}
            </div>
            <p className="text-gray-400 mt-2">
              Las órdenes aparecerán aquí cuando se generen automáticamente o se
              creen manualmente
            </p>
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      {showEditOrder && selectedOrder && (
        <EditOrderModal
          orden={selectedOrder}
          onClose={() => {
            setShowEditOrder(false);
            setSelectedOrder(null);
          }}
          onSuccess={() => {
            setShowEditOrder(false);
            setSelectedOrder(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

export default Compras;