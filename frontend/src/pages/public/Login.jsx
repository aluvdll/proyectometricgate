import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { loginUsuario } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";
import { NotificationModal } from "../../components/modals/NotificationModal";

export function Login() {
  const [error, setError] = useState("");
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyType, setNotifyType] = useState("error");

  const navigate = useNavigate();
  const { login } = useAuth();

  // Aqui inicializo React Hook Form con los valores por defecto de mi formulario.
  const {
    // Con register conecto cada input al estado interno del formulario.
    register,
    // Con handleSubmit valido todo y solo si pasa ejecuto onSubmit.
    handleSubmit,
    // Aqui leo los errores por campo para pintar los mensajes debajo del input.
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const showNotification = (title, message, type = "error") => {
    setNotifyTitle(title);
    setNotifyMessage(message);
    setNotifyType(type);
    setNotifyVisible(true);

    setTimeout(() => setNotifyVisible(false), 3500);
  };

  // Este metodo solo se ejecuta si React Hook Form valida bien todos los campos.
  const onSubmit = async (data) => {
    setError("");

    try {
      const res = await loginUsuario({
        email: data.email,
        password: data.password,
      });

      const authData = res?.data ?? {};
      login(authData.user, authData.token, authData.role);
      console.log("LOGIN RESPONSE:", res);

      if (authData.role === "super_admin") {
        navigate("/superadminPanel", { replace: true });
        return;
      }

      navigate("/adminPanel/", { replace: true });
    } catch (err) {
      if (err instanceof Error && err.message === "Usuario no registrado") {
        navigate("/tarifas", {
          replace: true,
          state: {
            notify: {
              title: "Usuario no registrado",
              message:
                "No hemos encontrado una cuenta con ese correo. Revisa las tarifas o solicita acceso.",
              type: "error",
            },
          },
        });
        return;
      }

      if (err instanceof Error && err.message) {
        setError(err.message);
        showNotification("Error", err.message, "error");
      } else {
        setError("Error de conexión con el servidor");
        showNotification("Error", "Error de conexión con el servidor", "error");
      }
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Paso onSubmit por handleSubmit para que React Hook Form controle la validacion. */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          {/* Campo de correo */}
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
                // Aqui registro el input y defino sus reglas de validacion.
                {...register("email", {
                  required: "El correo es obligatorio",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Correo no válido",
                  },
                })}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-400 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-orange-400"
              />
              {/* Si este campo falla, aqui muestro su mensaje de error */}
              {errors.email && (
                <p className="text-red-500 mt-1 text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Campo de contraseña */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
              >
                Contraseña:
              </label>
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => navigate("/recuperar-contraseña")}
                  className="font-semibold text-orange-300 hover:text-white dark:text-orange-200 dark:hover:text-white"
                >
                  ¿Has olvidado tu contraseña?
                </button>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                })}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-orange-400 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-orange-400"
              />
              {errors.password && (
                <p className="text-red-500 mt-1 text-sm">
                  {errors.password.message}
                </p>
              )}
              {error && <p className="text-red-500 mt-1">{error}</p>}
            </div>
          </div>

          {/* Botón de enviar */}
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-orange-400 px-3 py-1.5 text-sm/6 font-semibold text-gray-900 shadow-xs hover:bg-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-orange-400 dark:shadow-none dark:hover:text-white dark:hover:bg-orange-500 dark:focus-visible:outline-indigo-500"
            >
              Iniciar sesión
            </button>
          </div>
        </form>
      </div>

      {notifyVisible && (
        <NotificationModal
          title={notifyTitle}
          message={notifyMessage}
          type={notifyType}
        />
      )}
    </div>
  );
}

export default Login;
