Proyecto de Gestión de Productos y Carritos

Este proyecto es una API desarrollada con Node.js y Express.js para la gestión de productos y carritos de compras. Permite agregar, eliminar y consultar productos, así como administrar carritos de compras.

Tecnologías utilizadas

Node.js

Express.js

FS (File System) para almacenamiento en JSON

Postman (para pruebas de API)

Instalación y configuración

1. Clonar el repositorio

 git clone [https://github.com/MaxGonzalezRoy/BACKEND-I.git]
 
 cd BACKEND-1

2. Instalar dependencias

npm install

3. Ejecutar el servidor

npm start

El servidor se ejecutará en http://localhost:8080

Endpoints disponibles

Productos

GET /api/products → Obtiene todos los productos.

GET /api/products/:pid → Obtiene un producto por ID.

POST /api/products → Agrega un nuevo producto.

DELETE /api/products/:pid → Elimina un producto por ID.

Carritos

GET /api/carts → Obtiene todos los carritos.

GET /api/carts/:cid → Obtiene un carrito por ID.

POST /api/carts → Crea un nuevo carrito.

POST /api/carts/:cid/product/:pid → Agrega un producto a un carrito.

Notas adicionales

Los datos se almacenan en archivos JSON dentro de la carpeta data/.

Utiliza Postman o herramientas similares para probar los endpoints.

Asegúrate de que el archivo .gitignore incluya node_modules/ para evitar subir dependencias innecesarias al repositorio.

Autores

Desarrollado por Rodrigo GONZALEZ ROY
