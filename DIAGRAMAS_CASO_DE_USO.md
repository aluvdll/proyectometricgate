# MetricGatesApp - Diagramas de Caso de Uso

Este documento contiene diagramas de caso de uso (formato Mermaid) listos para explicar el sistema en clase.

---

## 1) Diagrama general del sistema

```mermaid
flowchart LR
    SA[Super Admin]
    AD[Admin Empresa]
    TE[Tecnico]
    VI[Visitante]
    ST[Stripe]

    subgraph MG[MetricGatesApp]
        UC1((Autenticarse))
        UC2((Recuperar contraseña))
        UC3((Gestionar empresas))
        UC4((Gestionar usuarios de empresa))
        UC5((Gestionar clientes))
        UC6((Gestionar presupuestos))
        UC7((Gestionar pedidos))
        UC8((Gestionar articulos y familias))
        UC9((Configurar articulo configurable))
        UC10((Calcular precio configurable))
        UC11((Iniciar checkout de registro))
        UC12((Completar registro de empresa))
        UC13((Enviar formulario de contacto))
    end

    SA --> UC1
    SA --> UC3
    SA --> UC4

    AD --> UC1
    AD --> UC4
    AD --> UC5
    AD --> UC6
    AD --> UC7
    AD --> UC8
    AD --> UC9
    AD --> UC10

    TE --> UC1
    TE --> UC5
    TE --> UC6
    TE --> UC7
    TE --> UC10

    VI --> UC2
    VI --> UC11
    VI --> UC12
    VI --> UC13

    ST --> UC11
    ST --> UC12
```

---

## 2) Caso de uso: Autenticacion y control de acceso

```mermaid
flowchart LR
    U[Usuario del sistema]

    subgraph AUTH[Modulo de autenticacion]
        A1((Iniciar sesion))
        A2((Ver perfil /me))
        A3((Cerrar sesion))
        A4((Solicitar reset de contraseña))
        A5((Restablecer contraseña))
        A6((Validar token Sanctum))
        A7((Validar acceso por empresa activa))
        A8((Validar rol super admin))
    end

    U --> A1
    U --> A2
    U --> A3
    U --> A4
    U --> A5

    A1 -. incluye .-> A6
    A2 -. incluye .-> A6
    A2 -. incluye .-> A7
    A3 -. incluye .-> A6
    A3 -. incluye .-> A7
    A8 -. extiende .-> A7
```

---

## 3) Caso de uso: Operacion interna por empresa

```mermaid
flowchart LR
    AD[Admin Empresa]
    TE[Tecnico]

    subgraph OPS[Operacion de empresa]
        O1((Gestionar usuarios de la empresa))
        O2((Gestionar clientes))
        O3((Crear presupuesto))
        O4((Editar presupuesto))
        O5((Consultar presupuesto))
        O6((Gestionar pedidos))
        O7((Gestionar familias de articulos))
        O8((Gestionar articulos estandar))
        O9((Consultar articulos configurables))
        O10((Actualizar reglas de precios configurables))
        O11((Calcular precio configurable))
    end

    AD --> O1
    AD --> O2
    AD --> O3
    AD --> O4
    AD --> O5
    AD --> O6
    AD --> O7
    AD --> O8
    AD --> O9
    AD --> O10
    AD --> O11

    TE --> O2
    TE --> O3
    TE --> O4
    TE --> O5
    TE --> O6
    TE --> O9
    TE --> O11

    O3 -. incluye .-> O11
    O4 -. incluye .-> O11
```

---

## 4) Caso de uso: Alta de empresa con Stripe

```mermaid
flowchart LR
    VI[Visitante]
    ST[Stripe]
    SA[Super Admin]

    subgraph PAY[Onboarding por pago]
        P1((Seleccionar plan))
        P2((Iniciar checkout))
        P3((Confirmar pago))
        P4((Recibir webhook de pago))
        P5((Habilitar empresa en sistema))
        P6((Completar registro final de empresa))
        P7((Crear usuario admin de la empresa))
        P8((Enviar email de confirmacion))
    end

    VI --> P1
    VI --> P2
    VI --> P3
    VI --> P6

    ST --> P3
    ST --> P4

    P2 -. incluye .-> P3
    P3 -. dispara .-> P4
    P4 -. incluye .-> P5
    P6 -. incluye .-> P7
    P6 -. incluye .-> P8

    SA --> P5
```

---

## 5) Matriz actor -> casos de uso (resumen para exponer)

| Actor            | Casos de uso clave                                                                     |
| ---------------- | -------------------------------------------------------------------------------------- |
| Visitante        | Contacto, recuperar contraseña, iniciar checkout, completar registro                   |
| Admin Empresa    | Gestionar usuarios, clientes, presupuestos, pedidos, articulos y precios configurables |
| Tecnico          | Operacion diaria: clientes, presupuestos, pedidos, calculo configurable                |
| Super Admin      | Gestion global de empresas y control de altas/bajas                                    |
| Stripe (externo) | Confirmacion de pagos y webhook para activar flujo de registro                         |

---

## 6) Como presentarlo al profesor (guion rapido)

1. Empezar por el diagrama general para mostrar vision global de actores.
2. Pasar a autenticacion para justificar seguridad (token + middleware + roles).
3. Explicar operacion por empresa (modulo principal del negocio).
4. Cerrar con Stripe para destacar integracion externa y automatizacion del alta.
5. Usar la matriz final como resumen ejecutivo de 1 minuto.
