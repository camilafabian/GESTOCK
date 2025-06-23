"use client";

import type React from "react";
import { useState } from "react";
import type { Proveedor } from "../types";
import { Building, Delete, Edit, Trash2 } from "lucide-react";
import { proveedoresApi } from "../services/api";

interface ProveedorCardProps {
  proveedor: Proveedor;
  onUpdate: () => void;
  onEdit: (proveedor: Proveedor) => void;
}

const ProveedorCard: React.FC<ProveedorCardProps> = ({
  proveedor,
  onUpdate,
  onEdit,
}) => {
  const [loading, setLoading] = useState(false);

  const getBrandLogo = (nombre: string) => {
    return (
      <div className="w-16 h-16 bg-gray-500 rounded-lg flex items-center justify-center">
        <Building className="w-8 h-8 text-white" />
      </div>
    );
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas dar de baja este proveedor?")) {
      return;
    }

    try {
      setLoading(true);
      await proveedoresApi.delete(proveedor.codigoProveedor);
      onUpdate();
    } catch (error) {
      console.error("Error al dar de baja el proveedor:", error);
      alert("Error al dar de baja el proveedor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-5 border border-gray-200 flex flex-col h-full">
      {/* Provider Logo */}
      <div className="flex justify-center mb-4">
        {getBrandLogo(proveedor.nombreProveedor)}
      </div>

      {/* Provider Info */}
      <div className="space-y-3 text-center flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-gray-900 uppercase">
          {proveedor.nombreProveedor}
        </h3>
        <p className="text-sm text-gray-600">Tienda Oficial</p>

        <div className="text-xs text-gray-600 space-y-1 text-left flex-1">
          <div>
            <span className="font-medium">CÓDIGO:</span>{" "}
            {proveedor.codigoProveedor}
          </div>
          <div>
            <span className="font-medium">Teléfono:</span>{" "}
            {proveedor.telefonoProveedor}
          </div>
          <div>
            <span className="font-medium">Dirección:</span>{" "}
            {proveedor.direccionProveedor}
          </div>
          <div>
            <span className="font-medium">E-mail:</span>{" "}
            {proveedor.emailProveedor}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-2 mt-auto flex justify-around">
          <div className="flex flex-col items-center gap-1 w-16">
            <button
              onClick={() => onEdit(proveedor)}
              className="p-2 bg-gray-600 text-white rounded-full hover:bg-red-700 transition-colors mt-2"
              title="Editar proveedor"
            >
              <Edit size={16} />
            </button>
            <span className="text-xs text-gray-600 font-medium">Editar</span>
          </div>
          <div className="flex flex-col items-center gap-1 w-16">
            <button
              onClick={handleDelete}
              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              title="Bajar proveedor"
            >
              <Delete size={16} />
            </button>
            <span className="text-xs text-gray-600 font-medium">Dar de baja</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProveedorCard;
