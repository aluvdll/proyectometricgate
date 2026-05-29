# Memoria tecnica del proyecto web (desde cero)

Fecha: 28/05/2026
Proyecto: MetricGate
Autor: Vicente Devesa Llorens

## 0. Como se construye esta web desde 0

Esta seccion explica el proceso real de desarrollo, no solo el resultado final. La idea es mostrar como se pasaria de una carpeta vacia a una aplicacion web funcional como MetricGate.

### 0.1 Fase de analisis y planificacion

Objetivo
- Definir que problema se va a resolver y para que tipo de usuario.
- Traducir necesidades de negocio a modulos tecnicos implementables.

Trabajo realizado
- Se identifican actores del sistema: super_admin, admin, commercial y technician.
- Se definen funcionalidades base: autenticacion, clientes, presupuestos, pedidos, articulos y administracion de empresas.
- Se divide el proyecto en dos capas:
  - Backend API en Laravel.
  - Frontend SPA en React con Vite.

Resultado
- Se obtiene un mapa claro de modulos, rutas y permisos antes de escribir codigo.

### 0.2 Fase de preparacion del entorno de desarrollo

Objetivo
- Tener un entorno local reproducible para desarrollar y probar.

Trabajo realizado
- Estructura de carpetas principal:
  - backendApi para API, modelos, migraciones y controladores.
  - frontend para interfaz de usuario y rutas de navegacion.
- Configuracion de variables de entorno:
  - Backend: .env con base de datos, correo, Stripe, URL frontend.
  - Frontend: URL base de la API para desarrollo y produccion.
- Instalacion de dependencias:
  - Backend: Composer para Laravel y Sanctum.
  - Frontend: npm para React, Router, Axios y utilidades UI.

Resultado
- Proyecto listo para ejecutar en local y comenzar a implementar funcionalidades.

### 0.3 Fase de modelado de datos (base de datos)

Objetivo
- Disenar entidades y relaciones que soporten los casos de uso.

Trabajo realizado
- Se modelan tablas principales:
  - companies
  - users
  - clients
  - budgets y sus lineas
  - orders y sus lineas
  - article_families
  - standard_articles
  - configurable_articles
- Se crean migraciones en Laravel para versionar estructura SQL.
- Se definen relaciones en modelos Eloquent (belongsTo, hasMany).

Como se genera con codigo
- Cada tabla se crea con una migracion.
- Cada entidad tiene su modelo con relaciones.
- Las reglas de integridad se aplican con claves foraneas y validaciones en controlador.

Resultado
- Base de datos coherente con el negocio y preparada para evolucionar por versiones.

### 0.4 Fase de construccion del backend API

Objetivo
- Exponer endpoints seguros para todas las operaciones de la aplicacion.

Trabajo realizado
- Se define enrutado en api.php por dominios de negocio.
- Se implementan controladores por modulo:
  - AuthController
  - UserController
  - CompanyController
  - ClientController
  - BudgetController
  - OrderController
  - ArticleFamilyController
  - StandardArticleController
  - ConfigurableArticleController
- Se aplican middleware:
  - auth:sanctum para autenticacion.
  - company para aislamiento por empresa.
  - superadmin para operaciones globales.
- Se devuelve JSON estructurado y codigos HTTP consistentes.

Como se genera con codigo
- Paso 1: crear ruta API.
- Paso 2: crear metodo en controlador (index, show, store, update, destroy).
- Paso 3: validar request con request->validate.
- Paso 4: ejecutar logica de negocio y persistencia con modelos.
- Paso 5: devolver respuesta JSON con estado HTTP correcto.

Resultado
- API modular, mantenible y lista para ser consumida por frontend.

### 0.5 Fase de construccion del frontend

Objetivo
- Crear una interfaz clara para zona publica y panel privado.

Trabajo realizado
- Se configura React Router para rutas publicas y privadas.
- Se implementa contexto de autenticacion para sesion y rol.
- Se crean guardas de navegacion:
  - PrivateRoute
  - SuperAdminRoute
  - RoleRoute
- Se crean pantallas de gestion por modulo:
  - usuarios
  - clientes
  - presupuestos
  - pedidos
  - familias
  - articulos
- Se conecta frontend con backend mediante peticiones HTTP.

Como se genera con codigo
- Paso 1: construir layout base (navbar, contenido, footer).
- Paso 2: crear paginas y componentes de formulario/listado.
- Paso 3: conectar formularios a endpoints API.
- Paso 4: tratar errores de validacion en pantalla.
- Paso 5: bloquear o mostrar vistas segun rol.

Resultado
- Aplicacion web navegable, con flujo completo de trabajo segun permisos.

### 0.6 Fase de integracion y pruebas

Objetivo
- Verificar que backend y frontend funcionan como un sistema unico.

Trabajo realizado
- Pruebas de endpoints con autenticacion y permisos.
- Pruebas de flujo de usuario de extremo a extremo:
  - login
  - gestion de clientes
  - creacion y actualizacion de presupuestos
  - seguimiento de pedidos
- Ejecucion de pruebas automatizadas en backend con php artisan test.

Resultado
- Se detectan y corrigen errores de validacion, permisos y navegacion antes de produccion.

### 0.7 Fase de despliegue y paso a produccion

Objetivo
- Publicar la aplicacion para acceso real por dominio.

Trabajo realizado
- Build del frontend para generar archivos estaticos.
- Ejecucion del backend como servicio systemd.
- Configuracion de Nginx para:
  - HTTPS obligatorio.
  - redireccion de dominio canonico.
  - proxy de /api al backend local.
- Configuracion DNS para resolver dominio y subdominio.

Resultado
- Sistema disponible en internet con frontend y API bajo el mismo dominio.

### 0.8 Resumen practico de desarrollo desde cero

Secuencia recomendada
1. Definir modulos y roles.
2. Modelar base de datos y crear migraciones.
3. Construir autenticacion y middleware base.
4. Implementar endpoints por modulo.
5. Crear frontend con rutas publicas y privadas.
6. Conectar formularios y listados a la API.
7. Probar permisos, validaciones y errores.
8. Compilar, desplegar y verificar en dominio real.

Conclusion de esta fase
- La web no se construye como una sola pieza, sino como un conjunto de modulos integrados.
- El orden correcto (analisis, datos, API, interfaz, pruebas y despliegue) reduce errores y facilita mantenimiento.

## 1. Implementacion

### 1.1 Modulo de autenticacion

Objetivo del modulo
- Permitir inicio y cierre de sesion seguro para usuarios del sistema.
- Permitir recuperacion y restablecimiento de contrasena.
- Entregar al frontend un token para consumir endpoints protegidos.

Endpoints y pantallas implicadas
- Endpoints backend:
  - POST /api/login
  - POST /api/forgot-password
  - POST /api/reset-password
  - GET /api/me
  - POST /api/logout
- Pantallas frontend:
  - /login
  - /recuperar-contrasena
  - /reset-password

Validaciones implementadas
- Login:
  - email obligatorio con formato valido.
  - password obligatoria.
  - usuario debe existir y estar activo.
  - en usuarios de empresa, la empresa debe estar activa.
- Recuperacion:
  - email obligatorio y existente en base de datos.
  - token de recuperacion con validez temporal (1 hora).
- Reset:
  - password minima de 6 caracteres y confirmacion obligatoria.

Resultado del modulo
- Se implementa autenticacion basada en token con Laravel Sanctum.
- El frontend recibe token y rol para controlar acceso a rutas privadas.
- El flujo de recuperacion de contrasena queda operativo por correo.

### 1.2 Modulo API de negocio

Objetivo del modulo
- Exponer la logica principal del sistema por API REST.
- Gestionar empresas, usuarios, clientes, presupuestos, pedidos y articulos.
- Mantener separacion por empresa y por rol.

Endpoints principales por dominio
- Empresas y gestion global (super admin):
  - GET /api/panel/superadmin/empresas
  - GET /api/panel/superadmin/empresas/{id}
  - POST /api/panel/superadmin/empresas/alta
  - PUT /api/panel/superadmin/empresas/{id}
  - PATCH /api/panel/superadmin/empresas/{id}/baja
  - PATCH /api/panel/superadmin/empresas/{id}/reactivar
  - GET /api/companies
  - GET /api/companies/{id}
  - POST /api/companies
  - PUT /api/companies/{id}
  - DELETE /api/companies/{id}
- Usuarios:
  - GET /api/users
  - POST /api/users
  - DELETE /api/users/{id}
  - GET /api/company/users
  - GET /api/company/users/{id}
  - POST /api/company/users
  - PUT /api/company/users/{id}
  - DELETE /api/company/users/{id}
- Clientes:
  - GET /api/company/clients
  - GET /api/company/clients/{id}
  - POST /api/company/clients
  - PUT /api/company/clients/{id}
- Presupuestos:
  - GET /api/company/budgets
  - GET /api/company/budgets/{id}
  - POST /api/company/budgets
  - PUT /api/company/budgets/{id}
- Pedidos:
  - GET /api/company/orders
  - GET /api/company/orders/{id}
  - PUT /api/company/orders/{id}
- Familias de articulos:
  - GET /api/company/article-families
  - GET /api/company/article-families/{id}
  - POST /api/company/article-families
  - PUT /api/company/article-families/{id}
- Articulos estandar:
  - GET /api/company/articles
  - GET /api/company/articles/{id}
  - POST /api/company/articles
  - PUT /api/company/articles/{id}
- Articulos configurables:
  - GET /api/company/configurable-articles
  - GET /api/company/configurable-articles/{id}
  - GET /api/company/configurable-articles/{id}/pricing
  - PUT /api/company/configurable-articles/{id}/pricing
  - POST /api/company/configurable-articles/{id}/calculate
- Contacto y pagos:
  - POST /api/contact/send-email
  - POST /api/checkout
  - POST /api/checkout/confirm
  - GET /api/checkout/registration/info
  - POST /api/checkout/registration/complete
  - POST /api/stripe/webhook

Validaciones implementadas
- Reglas por controlador mediante request->validate.
- Validaciones de formato, campos obligatorios y reglas de negocio por recurso.
- En pedidos: estado restringido a pendiente, en_curso o finalizado.
- Validacion de pertenencia a empresa para evitar acceso cruzado de datos.

Resultado del modulo
- API organizada por recursos y protegida por middleware de autenticacion y empresa.
- Estructura preparada para mantener escalabilidad por dominios de negocio.
- Integracion funcional con frontend y flujo de pagos.

### 1.3 Modulo de interfaz (frontend)

Objetivo del modulo
- Proporcionar interfaz publica para captacion y contacto.
- Proporcionar panel privado para operativa interna por roles.
- Consumir API de forma centralizada y segura.

Pantallas publicas
- /
- /tarifas
- /contacto
- /pago-aceptado
- /pago-cancelado
- /registro-empresa
- /login
- /recuperar-contrasena
- /reset-password
- /politica-privacidad
- /politica-cookies

Pantallas privadas y de gestion
- /superadminPanel
- /adminPanel
- /adminPanel/usuarios
- /adminPanel/usuarios/nuevouser
- /adminPanel/usuarios/vereditarusuario/:id
- /adminPanel/clientes
- /adminPanel/clientes/nuevocliente
- /adminPanel/clientes/vereditarcliente/:id
- /adminPanel/presupuestos
- /adminPanel/presupuestos/nuevopresupuesto
- /adminPanel/presupuestos/vereditarpresupuesto/:id
- /adminPanel/presupuestos/imprimir/:id
- /adminPanel/presupuestos/configurar-articulo
- /adminPanel/pedidos
- /adminPanel/pedidos/:id
- /adminPanel/familias
- /adminPanel/familias/nuevafamilia
- /adminPanel/familias/vereditarfamilia/:id
- /adminPanel/articulos
- /adminPanel/articulos/nuevoarticulo
- /adminPanel/articulos/vereditararticulo/:id
- /adminPanel/articulos/tarifas-configurables

Validaciones implementadas
- Proteccion de rutas con componentes PrivateRoute, SuperAdminRoute y RoleRoute.
- Bloqueo automatico de usuarios no autenticados.
- Redireccion por rol para evitar acceso a modulos no permitidos.

Resultado del modulo
- Interfaz separada entre zona publica y zona privada.
- Navegacion condicionada por permisos de usuario.
- Flujo de uso coherente para perfiles admin, commercial, technician y super_admin.

### 1.4 Modulo de administracion

Objetivo del modulo
- Permitir control global del sistema a super_admin.
- Permitir control de operativa diaria a admin de empresa.

Funciones principales
- Super admin:
  - Alta, baja y reactivacion de empresas.
  - Consulta global de empresas.
  - CRUD general de companies y usuarios globales.
- Admin empresa:
  - Gestion de usuarios de su empresa.
  - Gestion de clientes, presupuestos, pedidos, familias y articulos.

Validaciones implementadas
- Middleware superadmin para restringir panel y endpoints globales.
- Middleware company para imponer contexto de empresa en peticiones.

Resultado del modulo
- Administracion jerarquica por niveles.
- Separacion de responsabilidades entre gestion global y gestion operativa.

## 2. Seguridad

### 2.1 Autenticacion
- Sistema basado en Laravel Sanctum con token bearer.
- Login valida credenciales, estado de usuario y estado de empresa.
- Logout invalida tokens del usuario autenticado.

### 2.2 Autorizacion por roles
- Roles definidos: super_admin, admin, commercial, technician.
- Backend:
  - Middleware superadmin para endpoints de alto privilegio.
  - Middleware company para asegurar que el usuario trabaja en su empresa.
  - Controles por rol en controladores donde aplica (ejemplo pedidos).
- Frontend:
  - Guardas de ruta por sesion y rol.
  - Redireccion automatica ante acceso no autorizado.

### 2.3 Validacion de datos
- Validaciones server-side en controladores para todos los recursos clave.
- Validaciones de tipo, formato, obligatoriedad y reglas de negocio.
- Mensajes de error legibles para el usuario en flujos criticos.

### 2.4 Manejo de errores
- Respuestas HTTP consistentes:
  - 400 para peticiones invalidas (ejemplo token de reset invalido).
  - 401 para no autenticado.
  - 403 para no autorizado.
  - 404 para recurso no encontrado.
  - 422 para errores de validacion o estado invalido.
  - 500 para errores internos (ejemplo fallo de envio de correo).
- Captura de excepciones en flujos sensibles como Stripe y correo.

### 2.5 Seguridad de despliegue
- Nginx forzando HTTPS y redireccion de dominio canonico.
- Cabeceras de endurecimiento basicas:
  - X-Content-Type-Options nosniff
  - X-Frame-Options SAMEORIGIN
  - Referrer-Policy strict-origin-when-cross-origin
- Bloqueo de archivos ocultos salvo carpeta well-known.

## 3. Pruebas

### 3.1 Estrategia de pruebas por modulo
- Pruebas unitarias para logica aislada.
- Pruebas de integracion para endpoints API.
- Pruebas funcionales de frontend por flujo de usuario.
- Pruebas manuales de aceptacion sobre entorno de preproduccion/produccion.

### 3.2 Matriz de casos de prueba (esperado vs obtenido)

Modulo: Autenticacion
- Caso: login con credenciales validas.
  - Esperado: 200, token y datos de usuario.
  - Obtenido: pendiente de documentar en evidencia manual.
- Caso: login con password incorrecta.
  - Esperado: 401 con mensaje de error.
  - Obtenido: pendiente de documentar en evidencia manual.
- Caso: reset password con token expirado.
  - Esperado: 400 con error de token expirado.
  - Obtenido: pendiente de documentar en evidencia manual.

Modulo: API negocio
- Caso: crear cliente con datos completos.
  - Esperado: 200/201 y cliente persistido.
  - Obtenido: pendiente de documentar en evidencia manual.
- Caso: ver pedido de otra empresa.
  - Esperado: 404 o 403 segun politica del endpoint.
  - Obtenido: pendiente de documentar en evidencia manual.
- Caso: actualizar pedido con estado no permitido.
  - Esperado: 422 por validacion.
  - Obtenido: pendiente de documentar en evidencia manual.

Modulo: Interfaz
- Caso: usuario sin sesion abre panel privado.
  - Esperado: redireccion a login.
  - Obtenido: pendiente de documentar en evidencia manual.
- Caso: usuario commercial intenta entrar a gestion de usuarios.
  - Esperado: redireccion por rol sin acceso al recurso.
  - Obtenido: pendiente de documentar en evidencia manual.
- Caso: super_admin intenta abrir adminPanel normal.
  - Esperado: redireccion a superadminPanel.
  - Obtenido: pendiente de documentar en evidencia manual.

Modulo: Administracion
- Caso: super_admin da de alta empresa.
  - Esperado: empresa activa y visible en panel.
  - Obtenido: pendiente de documentar en evidencia manual.
- Caso: admin empresa intenta endpoint global de super admin.
  - Esperado: 403 no autorizado.
  - Obtenido: pendiente de documentar en evidencia manual.

### 3.3 Evidencia automatizada actual
- Ejecucion real de pruebas backend (Laravel/Pest):
  - 2 pruebas ejecutadas.
  - 2 pruebas superadas.
  - Duracion aproximada: 0.52 s.
- Nota: actualmente existen pruebas de ejemplo base. Se recomienda ampliar cobertura para los endpoints reales del proyecto.

## 4. Despliegue

### 4.1 Preparacion del servidor

Objetivo
- Dejar un entorno Linux listo para servir frontend y backend en produccion.

Pasos
- Instalar y habilitar servicios necesarios:
  - nginx
  - php-fpm compatible con la version del proyecto
  - mysql o acceso a servidor de base de datos
- Crear estructura de proyecto en:
  - /var/www/proyectometricgate/frontend
  - /var/www/proyectometricgate/backendApi
- Verificar permisos de lectura/ejecucion para usuario del servicio web.

Resultado
- Servidor preparado para publicar aplicacion con separacion frontend/backend.

### 4.2 Configuracion backend y frontend

Backend (Laravel)
- Instalar dependencias con composer install.
- Configurar archivo .env (APP_KEY, DB_*, MAIL_*, STRIPE_*, FRONTEND_URL).
- Ejecutar migraciones con php artisan migrate --force cuando aplique.
- Limpiar/cachear configuracion segun fase:
  - php artisan config:clear
  - php artisan config:cache
- Levantar servicio de backend con systemd:
  - servicio metricgate-backend
  - arranque: php artisan serve --host=127.0.0.1 --port=8000

Frontend (React + Vite)
- Instalar dependencias con npm ci o npm install.
- Generar build de produccion con npm run build.
- Publicar salida en /var/www/proyectometricgate/frontend/dist.

Resultado
- Backend disponible en localhost:8000 para proxy interno.
- Frontend estatico disponible para servir por Nginx.

### 4.3 DNS y servidor web

Nginx
- Configurar bloque de servidor para:
  - redireccion HTTP a HTTPS
  - redireccion metricgate.es a www.metricgate.es
  - servir frontend desde /var/www/proyectometricgate/frontend/dist
  - enrutar /api/ a 127.0.0.1:8000
- Aplicar SSL con certificados en /etc/nginx/ssl/metricgate.crt y .key.
- Recargar servicio: systemctl reload nginx.

DNS
- Zona metricgate.es con registros A:
  - ns1 -> IP servidor
  - @ -> IP servidor
  - www -> IP servidor
- Ajustar IP real del servidor en archivo de zona antes de publicar.
- Verificar resolucion con nslookup.

Resultado
- Dominio y subdominio resolviendo al servidor correcto.
- Trafico cifrado por HTTPS y API funcionando bajo mismo dominio.

### 4.4 Verificacion final de despliegue

Checklist tecnico
- Sitio publico abre en https://www.metricgate.es.
- Redirecciones de dominio y protocolo funcionan.
- Login en frontend responde contra API real.
- Rutas privadas respetan autenticacion y rol.
- Operaciones criticas (usuarios/clientes/presupuestos/pedidos) responden correctamente.
- Logs de nginx y backend sin errores bloqueantes.

Resultado final
- Aplicacion desplegada y operativa con separacion de capas, seguridad basica y control de acceso por rol.

## 5. Cierre y mejora continua

Situacion actual
- Arquitectura funcional en produccion con API Laravel y frontend React.
- Despliegue operativo en Nginx con HTTPS y servicio backend gestionado por systemd.
- Base de pruebas automatizadas inicial funcionando.

Mejoras propuestas para version siguiente
- Aumentar cobertura de pruebas en endpoints reales (auth, clientes, presupuestos, pedidos).
- Incorporar pruebas E2E de frontend para flujos criticos.
- Endurecer aun mas seguridad HTTP (CSP, rate limit por endpoint, auditoria de sesiones).
- Definir pipeline CI/CD para build, test y despliegue controlado.
