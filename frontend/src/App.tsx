import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

// Páginas públicas
import Home from "./pages/Home";
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
          <Route path="usuarios" index element={<UsersPanel />} />
          <Route path="presupuestos" element={<PresupuestosPanel />} />
          <Route
            path="presupuestos/nuevopresupuesto"
            element={<FormPresupuesto mode="create" />}
          />
          <Route
            path="usuarios/nuevouser"
            element={<FormUsuario mode="create" userId={undefined} />}
          />
          <Route
            path="usuarios/vereditarusuario/:id"
            element={<VerEditarUsuario />}
          />
          <Route
            path="presupuestos/vereditarpresupuesto/:id"
            element={<VerEditarPresupuesto />}
          />
          <Route path="clientes/nuevocliente" element={<FormNuevoCliente />} />
          <Route
            path="clientes/vereditarcliente/:id"
            element={<VerEditarCliente />}
          />
          <Route path="clientes" element={<ClientesPanel />} />

          <Route path="familias" element={<FamiliasArticulosPanel />} />
          <Route
            path="familias/nuevafamilia"
            element={<FormFamiliaArticulo mode="create" />}
          />
          <Route
            path="familias/vereditarfamilia/:id"
            element={<VerEditarFamiliaArticulo />}
          />

          <Route path="articulos" element={<ArticulosPanel />} />
          <Route
            path="articulos/nuevoarticulo"
            element={<FormArticulo mode="create" articuloId={undefined} />}
          />
          <Route
            path="articulos/vereditararticulo/:id"
            element={<VerEditarArticulo />}
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
