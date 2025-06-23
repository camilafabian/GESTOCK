"use client";

import type React from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from '../img/logo_gestock.png';
import {
  Package,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "Artículos", icon: Package },
    { path: "/intervalo-fijo", label: "Intervalo Fijo", icon: TrendingUp },
    { path: "/lote-fijo", label: "Lote Fijo", icon: TrendingDown },
    { path: "/proveedores", label: "Proveedores", icon: Users },
    { path: "/compras", label: "Compras", icon: ShoppingCart },
    { path: "/ventas", label: "Ventas", icon: DollarSign },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out min-h-screen
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="p-6 pt-6 h-full flex flex-col">
            {/* Logo in sidebar */}
            <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-700">
              <img className="h-14 w-auto" src={logo} alt=""/>
              <span className="text-4xl font-bold">GeStock</span>
            </div>

            <nav className="space-y-1 flex-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 group
                      ${
                        isActive(item.path)
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-slate-800 hover:text-white"
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                    {!isActive(item.path) && (
                      <span className="ml-auto text-gray-400 group-hover:text-white">
                        →
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
