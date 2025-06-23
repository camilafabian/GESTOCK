# GeStock Frontend

Sistema de gestión de inventario desarrollado con React, TypeScript y Vite.

## Características

- ✅ Gestión de artículos e inventario
- ✅ Administración de proveedores
- ✅ Órdenes de compra automatizadas
- ✅ Registro de ventas
- ✅ Modelos de inventario (Lote Fijo e Intervalo Fijo)
- ✅ Interfaz responsive con Tailwind CSS

## Tecnologías

- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Vite** - Herramienta de construcción
- **Tailwind CSS** - Framework de CSS
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos

## Instalación

1. Clona el repositorio:
\`\`\`bash
git clone <repository-url>
cd gestock-frontend
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
\`\`\`

3. Inicia el servidor de desarrollo:
\`\`\`bash
npm run dev
\`\`\`

4. Para construir para producción:
\`\`\`bash
npm run build
\`\`\`

5. Para previsualizar la construcción:
\`\`\`bash
npm run preview
\`\`\`

## Configuración del Backend

El frontend está configurado para conectarse a un backend en `http://localhost:8080/api`. Asegúrate de que el backend esté ejecutándose antes de usar la aplicación.

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la construcción de producción
- `npm run lint` - Ejecuta el linter

## Estructura del Proyecto

\`\`\`
src/
├── components/          # Componentes reutilizables
├── pages/              # Páginas de la aplicación
├── services/           # Servicios de API
├── types/              # Definiciones de tipos TypeScript
├── img/                # Imágenes y assets
├── App.tsx             # Componente principal
├── main.tsx            # Punto de entrada
└── globals.css         # Estilos globales
\`\`\`

## Funcionalidades

### Gestión de Artículos
- Crear, editar y eliminar artículos
- Visualización de stock actual y niveles de seguridad
- Indicadores visuales de estado de stock

### Gestión de Proveedores
- Administración de proveedores
- Asociación de artículos con proveedores
- Información de contacto y precios

### Órdenes de Compra
- Creación automática basada en modelos de inventario
- Gestión de estados (Pendiente, Enviada, Finalizada, Cancelada)
- Sugerencias inteligentes de cantidad y proveedor

### Modelos de Inventario
- **Lote Fijo**: Cantidad fija de pedido con punto de reorden
- **Intervalo Fijo**: Revisión periódica con inventario máximo

### Ventas
- Registro de ventas con actualización automática de stock
- Validación de stock disponible
- Historial de transacciones
