# MetricGatesApp

Proyecto académico desarrollado como parte de mi formación como estudiante en el **I.E.S. Pere Maria Orts i Bosch** de la localidad de **Benidorm (Alicante, España)**.

---

## 📌 Descripción

Esta aplicación forma parte de un proyecto académico cuyo objetivo es aprender y practicar el desarrollo de aplicaciones web modernas, así como el uso de **Git y GitHub** para el control de versiones y trabajo con repositorios remotos.

El proyecto está orientado al aprendizaje, por lo que su enfoque es principalmente formativo.

---

## 🛠️ Tecnologías usadas

### Frontend

* **React** (creado con **Vite**)  
* **Tailwind CSS** para el diseño y estilos

### Backend

* **Node.js**  
* **Express** como servidor backend  
* **MySQL** para gestión de base de datos  
* **dotenv** para configuración de variables de entorno  

### Base de datos

* **MySQL**, gestionada mediante **MySQL Workbench 8.0**

### Otras herramientas

* **Git** y **GitHub** para control de versiones

---

## Cómo ejecutar el proyecto

### 1️⃣ Clonar el repositorio

git clone https://github.com/aluvdll/MetricGatesApp
cd MetricGatesApp

### 2️⃣ Instalar dependencias
npm install
3️⃣ Configurar archivo .env
Crea un archivo .env basado en .env.example:

DB_HOST=localhost
DB_USER=tu_usuario       # Usuario de tu gestor de base de datos
DB_PASSWORD=tu_contraseña # Contraseña de tu gestor de base de datos
DB_NAME=prueba_bd
PORT=3001

# Para el formulario de contacto con envío de email
EMAIL_USER=correo_de_prueba@gmail.com
EMAIL_PASS=token_generado
EMAIL_RECEIVER=correo_de_prueba@gmail.com
⚠️ Nota: Nunca uses tu correo personal ni tu contraseña real.
Para pruebas, crea una cuenta de Gmail de prueba y genera un token de aplicación.

4️⃣ Ejecutar el backend
Acceder al directorio backend:

cd backend
Instalar las dependencias del backend:

npm install
Ejecutar el backend en modo desarrollo:

npm run dev
⚠️ Asegúrate de que MySQL Workbench esté ejecutándose y que la base de datos prueba_bd exista antes de iniciar el backend.

5️⃣ Ejecutar el frontend
Acceder al directorio frontend:

cd ../frontend
Instalar las dependencias del frontend:

npm install

Ejecutar el frontend en modo desarrollo:
npm run dev

⚠️ El frontend se comunica con el backend para obtener datos. Asegúrate de que el backend esté ejecutándose antes de usar la aplicación.

6️⃣ Configurar la base de datos
Abrir MySQL Workbench.

Crear una base de datos llamada prueba_bd.

Importar los datos desde el archivo SQL exportado:

-- En MySQL Workbench:
-- Archivo > Abrir SQL Script > seleccionar backend/database/prueba_bd.sql
-- Ejecutar
Crear su archivo .env basado en .env.example con sus credenciales de MySQL y correo de prueba.

🎓 Autor
aluvdll
Estudiante: Vicente Devesa Llorens
Curso: 2º DAW Semipresencial 2025–2026

📄 Estado del proyecto
Proyecto académico en desarrollo. Algunas funcionalidades aún están por implementar o mejorar, pero el proyecto está preparado para la evaluación final de la asignatura DWEC, aunque todavía tiene muchos aspectos por corregir y optimizar.

Para utilizar el panel de administrador, se debe usar un usuario de la base de datos con rol admin, por ejemplo:
Usuario: admin@admin.es

Contraseña: 1234

La aplicación está preparada para visualizarse en modo light o dark, según la configuración del equipo donde se despliegue la app.

# 🏠 PÁGINA DE INICIO

En la página de inicio podremos ver una presentación inicial con un nav.
En él se representa el logo de la app a la izquierda y, alineados hacia la derecha, los enlaces a Inicio, Tarifas y Contacto, seguidos de un botón de Login.

El inicio también dispone de un botón de Tarifas, que nos redirigirá a la página correspondiente.

Nada más abrir la página, podremos observar un icono del logo de WhatsApp, el cual nos abrirá un acceso directo a esta plataforma y nos permitirá escribir un mensaje al móvil configurado en el componente:

<FloatingWhatsApp
  phoneNumber="+34637141076"
  accountName="MetricGate"
  statusMessage="Preparado para ayudarle"
  chatMessage="¡Hola! ¿Cómo puedo ayudarte?"
  avatar="../public/fav_icon_metricGates.svg"
  allowClickAway={true}
  darkMode={true}
/>


En este componente se encuentra configurado el teléfono de WhatsApp del desarrollador inicial de la web. En caso de querer probarlo únicamente, bastará con cambiar la prop phoneNumber.

Para finalizar, veremos el footer, desde donde se podrá acceder a información relevante. Cabe destacar que, si se pulsa el número de teléfono desde un dispositivo con capacidad de realizar llamadas, esta se efectuará automáticamente.
Asimismo, si se pulsa el botón de ubicación, nos redirigirá a la localización exacta en Google Maps.

# 💳 PESTAÑA TARIFAS

La pestaña Tarifas muestra dos tarjetas con dos opciones distintas, cada una con un botón de Paga ahora, que en un futuro implementarán una pasarela bancaria.

# 📞 PESTAÑA CONTACTO

En esta pestaña encontraremos información de contacto y un formulario mediante el cual el cliente podrá enviar un correo electrónico.
Para que el envío funcione correctamente, será necesario tener configurado el archivo .env de forma adecuada.


# 🔐 LOGIN Y ROLES
El Login permitirá acceder al panel de administración y, según el rol del usuario, podrá realizar distintas funciones.
La aplicación está pensada para una empresa y cuenta con los siguientes roles:
# 👑 Usuario administrador (admin)
Podrá realizar cualquier operación:


Crear nuevos usuarios de la app, verlos, editarlos o eliminarlos.


Crear nuevos artículos, verlos, editarlos o eliminarlos.


Realizar también las operaciones asignadas a comerciales y técnicos.


# 🧾 Usuarios comerciales
Podrán:

Crear clientes, verlos, editarlos o eliminarlos.
Crear presupuestos, verlos, editarlos o eliminarlos.
Realizar también las operaciones de los técnicos.
Ver e imprimir presupuestos.

El usuario podrá realizarse una foto al rellenar sus datos, lo que permitirá identificarse mediante un avatar en los listados.

En la ficha de cliente se ha decidido no incluir esta funcionalidad, ya que el tipo de negocio no lo requiere.

En todos los listados (usuarios, clientes, artículos y presupuestos) se dispone de un campo de búsqueda que filtra por cualquier coincidencia en cualquiera de los campos mostrados.

Otra funcionalidad implementada es la posibilidad de insertar imágenes de productos en los artículos.

Como implementación actual, se está llevando a cabo la confección del PDF, que ya es descargable, aunque todavía está pendiente de una correcta reconfiguración.

Tareas pendientes que se implentará más adelante:
Hasear contraseñas
Activar y funcionar boton de registro
Recordar contraseña.
Pestaña demo, hablando sobre la app.
Pasarela bancaria (tARIFAS).
Mensajes de validación formularios personalizados.
Revisión de accesos por ROL.

