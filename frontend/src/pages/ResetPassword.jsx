import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  // Validar que el token exista en la URL
  if (!token) {
    return (
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-950/30">
            <p className="text-sm text-red-600 dark:text-red-400">
              El link de recuperación no es válido o ha expirado.
            </p>
          </div>
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <button
              onClick={() => navigate("/recuperar-contraseña")}
              className="font-semibold text-orange-300 hover:text-orange-500 dark:text-orange-200 dark:hover:text-white"
            >
              Solicitar nuevo link
            </button>
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    // Validaciones básicas
    if (!email.trim()) {
      setError("Por favor ingresa tu email");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setCargando(true);

    try {
      // Enviamos la nueva contraseña, email y el token al backend
      await axios.post("http://127.0.0.1:8000/api/reset-password", {
        token: token,
        email: email,
        password: password,
        password_confirmation: confirmPassword,
      });

      setMensaje("Contraseña actualizada exitosamente");

      // Después de 2 segundos, redirigir al login
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Error al actualizar la contraseña"
        );
      } else {
        setError("Error de conexión con el servidor");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Cambiar contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ingresa tu email y la nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo de email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
            >
              Correo electrónico:
            </label>
            <div className="mt-2">
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={cargando || !!mensaje}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-400 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Campo de nueva contraseña */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
            >
              Nueva contraseña:
            </label>
            <div className="mt-2">
              <input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={cargando || !!mensaje}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-400 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Campo de confirmación de contraseña */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
            >
              Confirmar contraseña:
            </label>
            <div className="mt-2">
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={cargando || !!mensaje}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-400 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-950/30">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Mensaje de éxito */}
          {mensaje && (
            <div className="rounded-md bg-green-50 p-4 dark:bg-green-950/30">
              <p className="text-sm text-green-600 dark:text-green-400">
                {mensaje}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Te redirigiremos al login en unos segundos...
              </p>
            </div>
          )}

          {/* Botón de enviar */}
          <div>
            <button
              type="submit"
              disabled={cargando || !!mensaje}
              className="flex w-full justify-center rounded-md bg-orange-400 px-3 py-1.5 text-sm/6 font-semibold text-gray-900 shadow-xs hover:bg-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-orange-400 dark:shadow-none dark:hover:text-white dark:hover:bg-orange-500 dark:focus-visible:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
