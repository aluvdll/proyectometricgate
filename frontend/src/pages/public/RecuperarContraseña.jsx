import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { API_URL } from "../../services/apiBase";

export function RecuperarContraseña() {
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  // Aqui inicializo React Hook Form con los valores por defecto de mi formulario.
  const {
    // Con register conecto cada input al estado interno del formulario.
    register,
    // Con handleSubmit valido todo y solo si pasa ejecuto onSubmit.
    handleSubmit,
    // Con reset limpio el campo cuando el envio sale bien.
    reset,
    // Aqui leo los errores por campo para pintar los mensajes debajo del input.
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  // Este metodo solo se ejecuta si React Hook Form valida bien todos los campos.
  const onSubmit = async (data) => {
    setError("");
    setMensaje("");
    setCargando(true);

    try {
      // Enviamos el email al backend para que genere un token y envíe el correo
      await axios.post(`${API_URL}/api/forgot-password`, {
        email: data.email,
      });

      setMensaje(
        "Se ha enviado un correo con instrucciones para recuperar tu contraseña.",
      );
      reset({ email: "" });

      // Después de 3 segundos, redirigir al login
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      if (err instanceof Error && err.message) {
        setError(err.message);
      } else if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Error al procesar tu solicitud",
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
            Recuperar contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Escribe tu email y te enviaremos un link para resetear tu contraseña
          </p>
        </div>

        {/* Paso onSubmit por handleSubmit para que React Hook Form controle la validacion. */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
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
                autoComplete="email"
                disabled={cargando || !!mensaje}
                // Aqui registro el input y defino sus reglas de validacion.
                {...register("email", {
                  required: "El correo es obligatorio",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Correo no válido",
                  },
                })}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-400 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {/* Si este campo falla, aqui muestro su mensaje de error */}
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
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
              {cargando ? "Enviando..." : "Enviar instrucciones"}
            </button>
          </div>
        </form>

        {/* Enlace para volver al login */}
        <p className="mt-6 text-center text-sm/6 text-gray-900 dark:text-gray-100">
          ¿Recordaste tu contraseña?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-semibold text-orange-300 hover:text-orange-500 dark:text-orange-200 dark:hover:text-white"
          >
            Vuelve al login
          </button>
        </p>
      </div>
    </div>
  );
}

export default RecuperarContraseña;
