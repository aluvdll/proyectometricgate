import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

// Páginas públicas
import Home from "./pages/Home.jsx";
import { Notfound } from "./pages/NotFound.jsx";
import { Login } from "./pages/Login";
import { Contacto } from "./pages/Contacto";
import { Tarifas } from "./pages/tarifas";
import { RecuperarContraseña } from "./pages/RecuperarContraseña";
import { ResetPassword } from "./pages/ResetPassword";
import { PoliticaCookies } from "./pages/PoliticaCookies";

// Páginas privadas (Admin)
import { AdminPanel } from "./pages/AdminPanel";
import { UsersPanel } from "./pages/UsersPanel.jsx";
import { FormUsuario } from "./components/FormUsuario";
import { Dashboard } from "./components/Dashboard.jsx";

// Componentes
import { Nav } from "./components/nav";
import { Footer } from "./components/Footer/Footer";
import { CookieBanner } from "./components/CookieBanner";

// Context
import { useAuth } from "./context/AuthContext";
import type { ReactNode } from "react";
import { VerEditarUsuario } from "./components/VerEditarUsuario.jsx";
import { PresupuestosPanel } from "./components/PresupuestoPanel.jsx";
import { FormPresupuesto } from "./components/FormPresupuesto.jsx";
import { VerEditarPresupuesto } from "./components/VerEditarPresupuesto.jsx";
import { PedidosPanel } from "./components/PedidosPanel.jsx";
import { DetallePedido } from "./components/DetallePedido.jsx";
import { FormNuevoCliente } from "./FormNuevoCliente";
import { ClientesPanel } from "./components/ClientesPanel.jsx";
import { VerEditarCliente } from "./components/VerEditarCliente.jsx";
import { ArticulosPanel } from "./components/ArticulosPanel.jsx";
import { FamiliasArticulosPanel } from "./components/FamiliasArticulosPanel.jsx";
import FormFamiliaArticulo from "./components/FormFamiliaArticulo.jsx";
import FormArticulo from "./components/FormArticulo.jsx";
import { VerEditarArticulo } from "./components/VerEditarArticulo.jsx";
import { VerEditarFamiliaArticulo } from "./components/VerEditarFamiliaArticulo.jsx";
import { SuperAdminPanel } from "./pages/SuperAdminPanel";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad.jsx";
import ConfigurarArticuloConfigurablePage from "./pages/ConfigurarArticuloConfigurablePage.jsx";
import ConfigurablePricingPage from "./pages/ConfigurablePricingPage.jsx";
import BudgetPrintPage from "./pages/BudgetPrintPage.jsx";

// ----------------------------
// Componente que protege rutas privadas
// ----------------------------
function PrivateRoute({ children }: { children: ReactNode }) {
  const { isLogged, loading } = useAuth();

  // ⛔ Esperar a que cargue sesión
  if (loading) return <div>Cargando...</div>;

  // 🔐 Si está logueado entra
  if (isLogged) return <>{children}</>;

  // ❌ Si no, fuera
  return <Navigate to="/login" replace />;
}

function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { isLogged, loading, role, user, token } = useAuth();

  const rolSesion = role ?? user?.role ?? localStorage.getItem("role");
  const tokenSesion = token ?? localStorage.getItem("token");
  const usuarioSesion = user ?? localStorage.getItem("usuario");
  const autenticado = isLogged || (!!tokenSesion && !!usuarioSesion);

  if (loading) return <div>Cargando...</div>;

  if (!autenticado) return <Navigate to="/login" replace />;

  if (rolSesion !== "super_admin") return <Navigate to="/adminPanel" replace />;

  return <>{children}</>;
}

function RoleRoute({
  children,
  allowedRoles,
  redirectTo = "/adminPanel",
}: {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}) {
  const { isLogged, loading, role, user, token } = useAuth();

  const rolSesion = role ?? user?.role ?? localStorage.getItem("role");
  const tokenSesion = token ?? localStorage.getItem("token");
  const usuarioSesion = user ?? localStorage.getItem("usuario");
  const autenticado = isLogged || (!!tokenSesion && !!usuarioSesion);

  if (loading) return <div>Cargando...</div>;

  if (!autenticado) return <Navigate to="/login" replace />;

  if (!rolSesion || !allowedRoles.includes(rolSesion)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

// ----------------------------
// Layout para páginas públicas (landing)
// ----------------------------
function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main>{children}</main>
      <Footer /> {/* Footer visible solo en público */}
    </>
  );
}

// ----------------------------
// Componente principal de la app
// ----------------------------
export default function App() {
  return (
    <BrowserRouter>
      <Nav /> {/* Navbar visible en todas las páginas públicas */}
      <Routes>
        {/* ---------------------- */}
        {/* Páginas públicas */}
        {/* ---------------------- */}

        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />
        <Route
          path="/tarifas"
          element={
            <PublicLayout>
              <Tarifas />
            </PublicLayout>
          }
        />
        <Route
          path="/contacto"
          element={
            <PublicLayout>
              <Contacto />
            </PublicLayout>
          }
        />
        <Route
          path="/login"
          element={
            <PublicLayout>
              <Login />
            </PublicLayout>
          }
        />
        <Route
          path="/recuperar-contraseña"
          element={
            <PublicLayout>
              <RecuperarContraseña />
            </PublicLayout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicLayout>
              <ResetPassword />
            </PublicLayout>
          }
        />

        <Route
          path="/politica-privacidad"
          element={
            <PublicLayout>
              <PoliticaPrivacidad />
            </PublicLayout>
          }
        />

        <Route
          path="/politica-cookies"
          element={
            <PublicLayout>
              <PoliticaCookies />
            </PublicLayout>
          }
        />

        {/* ---------------------- */}
        {/* Panel de administración (privado) */}
        {/* ---------------------- */}
        <Route
          path="/superadminPanel"
          element={
            <SuperAdminRoute>
              <SuperAdminPanel />
            </SuperAdminRoute>
          }
        />

        <Route
          path="/adminPanel"
          element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route
            path="usuarios"
            index
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <UsersPanel />
              </RoleRoute>
            }
          />
          <Route
            path="presupuestos"
            element={
              <RoleRoute
                allowedRoles={["admin", "commercial"]}
                redirectTo="/adminPanel/pedidos"
              >
                <PresupuestosPanel />
              </RoleRoute>
            }
          />
          <Route
            path="presupuestos/nuevopresupuesto"
            element={
              <RoleRoute
                allowedRoles={["admin", "commercial"]}
                redirectTo="/adminPanel/pedidos"
              >
                <FormPresupuesto mode="create" />
              </RoleRoute>
            }
          />
          <Route
            path="presupuestos/configurar-articulo"
            element={
              <RoleRoute
                allowedRoles={["admin", "commercial"]}
                redirectTo="/adminPanel/pedidos"
              >
                <ConfigurarArticuloConfigurablePage />
              </RoleRoute>
            }
          />
          <Route
            path="presupuestos/vereditarpresupuesto/:id"
            element={
              <RoleRoute
                allowedRoles={["admin", "commercial"]}
                redirectTo="/adminPanel/pedidos"
              >
                <VerEditarPresupuesto />
              </RoleRoute>
            }
          />
          <Route
            path="presupuestos/imprimir/:id"
            element={
              <RoleRoute
                allowedRoles={["admin", "commercial"]}
                redirectTo="/adminPanel/pedidos"
              >
                <BudgetPrintPage />
              </RoleRoute>
            }
          />

          {/* RUTAS DE PEDIDOS */}
          <Route path="pedidos" element={<PedidosPanel />} />
          <Route path="pedidos/:id" element={<DetallePedido />} />

          <Route
            path="articulos/tarifas-configurables"
            element={
              <RoleRoute allowedRoles={["admin", "commercial"]}>
                <ConfigurablePricingPage />
              </RoleRoute>
            }
          />
          <Route
            path="usuarios/nuevouser"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <FormUsuario mode="create" userId={undefined} />
              </RoleRoute>
            }
          />
          <Route
            path="usuarios/vereditarusuario/:id"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <VerEditarUsuario />
              </RoleRoute>
            }
          />
          <Route
            path="clientes/nuevocliente"
            element={
              <RoleRoute allowedRoles={["admin", "commercial"]}>
                <FormNuevoCliente />
              </RoleRoute>
            }
          />
          <Route
            path="clientes/vereditarcliente/:id"
            element={
              <RoleRoute allowedRoles={["admin", "commercial"]}>
                <VerEditarCliente />
              </RoleRoute>
            }
          />
          <Route
            path="clientes"
            element={
              <RoleRoute allowedRoles={["admin", "commercial"]}>
                <ClientesPanel />
              </RoleRoute>
            }
          />

          <Route
            path="familias"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <FamiliasArticulosPanel />
              </RoleRoute>
            }
          />
          <Route
            path="familias/nuevafamilia"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <FormFamiliaArticulo mode="create" />
              </RoleRoute>
            }
          />
          <Route
            path="familias/vereditarfamilia/:id"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <VerEditarFamiliaArticulo />
              </RoleRoute>
            }
          />

          <Route
            path="articulos"
            element={
              <RoleRoute
                allowedRoles={["admin", "commercial", "technician", "tecnician"]}
              >
                <ArticulosPanel />
              </RoleRoute>
            }
          />
          <Route
            path="articulos/nuevoarticulo"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <FormArticulo mode="create" articuloId={undefined} />
              </RoleRoute>
            }
          />
          <Route
            path="articulos/vereditararticulo/:id"
            element={
              <RoleRoute
                allowedRoles={["admin", "commercial", "technician", "tecnician"]}
              >
                <VerEditarArticulo />
              </RoleRoute>
            }
          />
        </Route>

        {/* ---------------------- */}
        {/* Ruta de error 404 */}
        {/* ---------------------- */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <Notfound />
            </PublicLayout>
          }
        />
      </Routes>
      <CookieBanner />
    </BrowserRouter>
  );
}
