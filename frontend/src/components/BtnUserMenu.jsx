import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RAW_API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_URL = RAW_API_URL.replace(/\/api\/?$/, "");

export function BtnUserMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  function handlerlogout() {
    console.log("Logout clicked");
    localStorage.clear();
    setOpen(false);
    auth.logout();
    navigate("/home");
  }

  function getAvatarUrl() {
    const avatar =
      auth.user?.avatar ||
      auth.user?.avatarUrl ||
      auth.user?.avatar_url ||
      "";

    if (!avatar) return "/ico_avatar_default.png";

    // Soporta avatar en varios formatos para evitar URLs rotas.
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
      return avatar;
    }

    if (avatar.startsWith("/storage/")) {
      return `${API_URL}${avatar}`;
    }

    if (avatar.startsWith("storage/")) {
      return `${API_URL}/${avatar}`;
    }

    return `${API_URL}/storage/${avatar}`;
  }
  

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 px-3 py-2 rounded border-2 border-orange-400 hover:bg-orange-300 text-gray-900 hover:text-white"
      >
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

      <div
        className={`${
          open ? "" : "hidden"
        } absolute right-0 mt-2 w-48 bg-orange-300 border rounded shadow-lg text-gray-900 border-amber-300 `}
      >
        <a
          href="/adminPanel"
          className="block px-4 py-2 hover:bg-orange-400 text-gray-900 hover:text-white"
        >
          {auth.user?.role === "super_admin"
            ? "SuperAdminPanel"
            : auth.user?.role === "admin"
              ? "AdminPanel"
              : auth.user?.role === "commercial"
                ? "ComerPanel"
                : auth.user?.role === "tecnician"
                  ? "TecniPanel"
                  : ""}
        </a>

        <a
          href={`/adminPanel/usuarios/vereditarusuario/${auth.user?.id}`}
          className="block px-4 py-2 hover:bg-orange-400 text-gray-900 hover:text-white"
        >
          Settings
        </a>

        <a
          href="#"
          onClick={handlerlogout}
          className="block px-4 py-2 hover:bg-orange-400 hover:transition-colors-duration-200 text-red-500 hover:text-white transition-colors duration-1000"
        >
          Logout
        </a>
      </div>
    </div>
  );
}
