import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import AvatarInput from "../shared/AvatarInput";
import { useAuth } from "../../context/AuthContext";
import { NotificationModal } from "../modals/NotificationModal";

import { API_URL } from "../../services/apiBase";


const valoresIniciales = {
  name: "",
  dni: "",
  address: "",
  phone: "",
  city: "",
  province: "",
  role: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function FormUsuario({ mode, userId }) {
  const isEdit = mode === "edit";
  const { token, user: authUser, updateUser } = useAuth();
  const isAdmin = authUser?.role === "admin";
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyType, setNotifyType] = useState("success");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: valoresIniciales,
  });

  const showNotification = (title, message, type) => {
    setNotifyTitle(title);
    setNotifyMessage(message);
    setNotifyType(type);
    setNotifyVisible(true);

    setTimeout(() => setNotifyVisible(false), 2500);
  };

  useEffect(() => {
    if (isEdit && userId) {
      axios
        .get(`http://127.0.0.1:8000/api/company/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          reset({
            name: res.data.name ?? "",
            dni: res.data.dni ?? "",
            address: res.data.address ?? "",
            phone: res.data.phone ?? "",
            city: res.data.city ?? "",
            province: res.data.province ?? "",
            role: res.data.role ?? "",
            email: res.data.email ?? "",
            password: "",
            confirmPassword: "",
          });
          setAvatar(null);
          setAvatarUrl(res.data.avatar ?? null);
          setRemoveAvatar(false);
        })

        .catch(() => {
          showNotification(
            "Error",
            "Error cargando usuario. Inténtalo de nuevo.",
            "error",
          );
        });
    }
  }, [isEdit, userId, token, reset]);

  const onSubmit = async (data) => {
    if (!token) {
      showNotification(
        "Error",
        "Sesión expirada. Vuelve a iniciar sesión.",
        "error",
      );

      return;
    }

    try {
      const payload = new FormData();
      payload.append("name", data.name);
      payload.append("dni", data.dni);
      payload.append("address", data.address || "");
      payload.append("phone", data.phone || "");
      payload.append("city", data.city || "");
      payload.append("province", data.province || "");

      if (!isEdit || isAdmin) {
        payload.append("role", data.role);
      }

      if (!isEdit) {
        payload.append("email", data.email);
        payload.append("password", data.password);
      }

      if (avatar) {
        payload.append("avatar", avatar);
      }

      if (isEdit && removeAvatar) {
        payload.append("remove_avatar", "1");
      }

      if (isEdit && userId) {
        payload.append("_method", "PUT");
        const response = await axios.post(
          `http://127.0.0.1:8000/api/company/users/${userId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );

        // Si el usuario editado es el usuario logueado, sincronizamos AuthContext
        // para que el avatar/nombre del menú se refresquen sin relogin.
        if (
          authUser?.id &&
          Number(userId) === Number(authUser.id) &&
          response?.data?.user
        ) {
          updateUser(response.data.user);
        }

        showNotification("Éxito", "Usuario editado", "success");
        setTimeout(() => {
          navigate(isAdmin ? "/adminPanel/usuarios" : "/adminPanel");
        }, 2500);
      } else {
        await axios.post("http://127.0.0.1:8000/api/company/users", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        showNotification("Éxito", "Usuario creado", "success");
        setTimeout(() => {
          navigate("/adminPanel/usuarios");
          reset(valoresIniciales);
          setAvatar(null);
          setAvatarUrl(null);
          setRemoveAvatar(false);
        }, 2500);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;

        const validationErrors = responseData?.errors
          ? Object.values(responseData.errors).flat().join("\n")
          : null;

        const message =
          validationErrors ||
          responseData?.message ||
          responseData?.error ||
          error.message ||
          "Error al guardar usuario";

        showNotification("Error", message, "error");
      } else {
        showNotification("Error", "Error al guardar usuario", "error");
      }
    }
  };

  return (
    <div className="container mt-1 w-full rounded-md border border-orange-500">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full mx-auto p-8 rounded-md shadow-md"
      >
        <h2 className="text-xl font-bold mb-6 text-gray-700 dark:text-gray-200">
          {isEdit ? "Editar usuario" : "Nuevo usuario"}
        </h2>

        {[
          ["Nombre", "name"],
          ["DNI", "dni"],
          ["Dirección", "address"],
          ["Teléfono", "phone"],
          ["Ciudad", "city"],
          ["Provincia", "province"],
        ].map(([label, field]) => (
          <div key={field} className="mb-4">
            <label className="block text-sm font-bold mb-2">{label}</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-md border border-orange-500"
              {...register(field, {
                required: `El campo ${label} es obligatorio`,
              })}
            />
            {errors[field] && (
              <p className="mt-1 text-sm text-red-500">
                {errors[field].message}
              </p>
            )}
          </div>
        ))}

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            disabled={isEdit}
            className="w-full px-3 py-2 rounded-md border border-orange-500"
            {...register("email", {
              required: "El email es obligatorio",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Email no válido",
              },
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {(!isEdit || isAdmin) && (
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Rol</label>
            <select
              className="w-full px-3 py-2 rounded-md border border-orange-500"
              {...register("role", {
                required: "Debes seleccionar un rol",
              })}
            >
              <option className="bg-amber-200 text-gray-700" value="">
                Selecciona un rol
              </option>

              <option className="text-gray-700" value="admin">
                Admin
              </option>

              <option className="text-gray-700" value="commercial">
                Comercial
              </option>
              <option className="text-gray-700" value="technician">
                Técnico
              </option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {!isEdit && (
            <div className="flex-1">
              <label className="block text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full px-3 py-2 rounded-md border border-orange-500 appearance-none"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                  minLength: {
                    value: 6,
                    message: "La contraseña debe tener al menos 6 caracteres",
                  },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}

              <label className="block text-sm font-bold mt-4 mb-2">
                Confirmar Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full px-3 py-2 rounded-md border border-orange-500 appearance-none"
                {...register("confirmPassword", {
                  required: "Debes confirmar la contraseña",
                  validate: (value) =>
                    value === watch("password") ||
                    "Las contraseñas no coinciden",
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          )}

          <div className="flex-1">
            <label className="block text-sm font-bold mb-2">Avatar</label>
            <AvatarInput
              value={avatar}
              avatarUrl={avatarUrl ? `${API_URL}/storage/${avatarUrl}` : null}
              onChange={(newAvatar) => {
                setAvatar(newAvatar);
                setValue("avatar", newAvatar);
                setRemoveAvatar(false);
              }}
            />
            {isEdit && (avatar || avatarUrl) && (
              <button
                type="button"
                onClick={() => {
                  setAvatar(null);
                  setAvatarUrl(null);
                  setValue("avatar", null);
                  setRemoveAvatar(true);
                }}
                className="mt-3 rounded-md border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Quitar avatar
              </button>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Tamaño máximo permitido: 15MB.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md"
        >
          {isEdit ? "Guardar cambios" : "Añadir usuario"}
        </button>
      </form>

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

export default FormUsuario;
