import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../services/apiBase";

const RAW_API_URL = API_URL.replace(/\/api\/?$/, "");

// Menú desplegable del usuario autenticado: muestra avatar, nombre, rol
// y enlaces a panel, perfil y cierre de sesión.
export function BtnUserMenu() {
  // Controla si el dropdown está abierto o cerrado
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();
  // Referencia al contenedor del menú para detectar clics fuera de él
  const menuRef = useRef(null);
  const esSuperAdmin = auth.user?.role === "super_admin";

  // Cierra el dropdown al hacer clic fuera del componente.
  // useEffect con [] se ejecuta solo una vez al montar el componente.
  useEffect(() => {
    // Esta función se invoca en cada "mousedown" del documento.
    // 'e.target' es el elemento exacto donde el usuario hizo clic.
    function handleClickOutside(e) {
      // menuRef.current apunta al <div> raíz del componente.
      // contains() devuelve true si el clic fue DENTRO del menú → no hacemos nada.
      // Si devuelve false, el clic fue FUERA → cerramos el dropdown.
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    // Registramos el listener a nivel de documento para capturar
    // cualquier clic en toda la página, no solo dentro del componente.
    document.addEventListener("mousedown", handleClickOutside);

    // Función de limpieza: React la llama al desmontar el componente.
    // Evita memory leaks eliminando el listener cuando el menú desaparece del DOM.
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // [] = sin dependencias → el efecto no se repite en cada render

  // Limpia el estado local, llama al logout del contexto y redirige al inicio
  function cerrarSesion() {
    localStorage.clear();
    setOpen(false);
    auth.logout();
    navigate("/");
  }

  // Resuelve la URL del avatar soportando rutas absolutas, relativas y de storage
  function getAvatarUrl() {
    const avatar =
      auth.user?.avatar || auth.user?.avatarUrl || auth.user?.avatar_url || "";

    if (!avatar || avatar === "0") return "/ico_avatar_default.png";

    // URL absoluta: se usa directamente
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
      return avatar;
    }

    // Ruta de storage con o sin barra inicial
    if (avatar.startsWith("/storage/")) {
      return `${API_URL}${avatar}`;
    }

    if (avatar.startsWith("storage/")) {
      return `${API_URL}/${avatar}`;
    }

    // Fallback: asume que está en /storage/
    return `${API_URL}/storage/${avatar}`;
  }

  return (
    // ref permite detectar clics fuera del menú completo (botón + dropdown)
    <div className="relative" ref={menuRef}>
      {/* Botón principal: muestra avatar, nombre y rol del usuario */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 px-3 py-2 rounded border-2 border-orange-400 hover:bg-orange-300 text-gray-900 hover:text-white"
      >
        {/* Avatar con fallback a imagen por defecto si falla la carga */}
        <img
          src={getAvatarUrl()}
          alt="user"
          className="w-8 h-8 rounded-full"
          onError={(e) => {
            e.currentTarget.src = "/ico_avatar_default.png";
          }}
        />

        <div className="flex flex-col">
          <span className="text-xs font-bold">{auth.user?.name}</span>
          <span className="text-xs ">{auth.user?.role}</span>
        </div>

        {/* Icono de flecha que indica desplegable */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown: visible solo cuando open === true */}
      <div
        className={`${
          open ? "" : "hidden"
        } absolute right-0 mt-2 w-48 bg-orange-300 border rounded shadow-lg text-gray-900 border-amber-300 `}
      >
        {!esSuperAdmin && (
          <>
            {/* Enlace al panel según el rol del usuario */}
            <Link
              to="/adminPanel"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 hover:bg-orange-400 text-gray-900 hover:text-white"
            >
              {auth.user?.role === "admin"
                ? "AdminPanel"
                : auth.user?.role === "commercial"
                  ? "ComerPanel"
                  : auth.user?.role === "technician"
                    ? "TecniPanel"
                    : "Panel"}
            </Link>

            {/* Enlace al perfil del usuario autenticado */}
            <Link
              to={`/adminPanel/usuarios/vereditarusuario/${auth.user?.id}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 hover:bg-orange-400 text-gray-900 hover:text-white"
            >
              Mi Perfil
            </Link>
          </>
        )}

        {/* Botón de cierre de sesión: limpia estado y redirige a /home */}
        <button
          type="button"
          onClick={cerrarSesion}
          className="block w-full text-left px-4 py-2 hover:bg-orange-400 text-red-500 hover:text-white transition-colors duration-300"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
