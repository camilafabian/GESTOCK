-- Script para agregar la columna url_imagen a la tabla articulo
-- Ejecutar este script en la base de datos PostgreSQL

-- Verificar si la columna ya existe antes de agregarla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'articulo' 
        AND column_name = 'url_imagen'
    ) THEN
        ALTER TABLE articulo ADD COLUMN url_imagen VARCHAR(500);
        RAISE NOTICE 'Columna url_imagen agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna url_imagen ya existe';
    END IF;
END $$; 