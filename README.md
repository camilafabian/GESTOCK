# GESTOCK
Trabajo Final de Investigación Operativa 2025. Sistema de gestión de inventarios. Grupo 2


# INSTRUCCIONES
Cómo abrir el proyecto.
1.	Descargar el repositorio. 
Ingresa al siguiente link y una vez posicionado en la rama main, presionar code y luego download .ZIP
Enlace: https://github.com/camilafabian/GESTOCK
Luego se debe descomprimir la carpeta.


2.	Generar la base de datos.
Abrir Postgres y crear un usuario llamado postgres y la contraseña es “popotas01”
Crear una base de datos llamada inventario_retail
Ejecutado el backend deben generarse las 7 tablas y luego se debe ejecutar el siguiente script:


-- Carga de datos en la tabla 'modelo'
INSERT INTO modelo (codigo_modelo, nombre_modelo) VALUES
(1, 'Lote Fijo'),
(2, 'Intervalo Fijo');


-- Carga de datos en la tabla 'estado_orden_compra'
INSERT INTO estado_orden_compra (codigo_eoc, nombre_estado) VALUES
(1, 'Finalizada'),
(2, 'Cancelada'),
(3, 'Pendiente'),
(4, 'Enviada');


3.	Abrir el backend.
Abrir la carpeta Gestock-Backend en intellij y ejecutar
GestockApplication.java


4.	Abrir el frontend.
Abrir la carpeta Gestock-Frontend en Visual Studio Code y ejecutar los siguientes comandos:
-	npm install
-	npm run dev
hacer Ctrl+click en el enlace que dice “localhost” y eso abrirá una pagina en su navegador predeterminado

