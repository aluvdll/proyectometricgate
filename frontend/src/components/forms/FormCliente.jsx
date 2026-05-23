import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  actualizarClienteEmpresa,
  crearClienteEmpresa,
  obtenerClienteEmpresa,
} from "../../services/clientes";
import { NotificationModal } from "../modals/NotificationModal";

const valoresIniciales = {
  nombre: "",
  direccion: "",
  email: "",
  telefono: "",
  telefono2: "",
  dni: "",
  poblacion: "",
  provincia: "",
  codigo_postal: "",
};

export function FormCliente({ mode, clientId }) {
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [clientNumber, setClientNumber] = useState(null);
  const [loadingClient, setLoadingClient] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyType, setNotifyType] = useState("success");

  const {
    register,
    handleSubmit,
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
    if (!isEdit || !clientId) {
      return;
    }

    setLoadingClient(true);

    obtenerClienteEmpresa(clientId)
      .then((cliente) => {
        setClientNumber(cliente.client_number ?? null);
        reset({
          nombre: cliente.nombre ?? "",
          direccion: cliente.direccion ?? "",
          email: cliente.email ?? "",
          telefono: cliente.telefono ?? "",
          telefono2: cliente.telefono2 ?? "",
          dni: cliente.dni ?? "",
          poblacion: cliente.poblacion ?? "",
          provincia: cliente.provincia ?? "",
          codigo_postal: cliente.codigo_postal ?? "",
        });
      })
      .catch((error) => {
        showNotification(
          "Error",
          error.message || "Error cargando cliente. Inténtalo de nuevo.",
          "error",
        );
      })
      .finally(() => {
        setLoadingClient(false);
      });
  }, [clientId, isEdit, reset]);

  const onSubmit = async (data) => {
    setSaving(true);

    try {
      const payload = {
        nombre: data.nombre,
        direccion: data.direccion,
        email: data.email || "",
        telefono: data.telefono || "",
        telefono2: data.telefono2 || "",
        dni: data.dni || "",
        poblacion: data.poblacion,
        provincia: data.provincia,
        codigo_postal: data.codigo_postal,
      };

      if (isEdit && clientId) {
        await actualizarClienteEmpresa(clientId, payload);
        showNotification("Éxito", "Cliente editado", "success");
        setTimeout(() => navigate("/adminPanel/clientes"), 2500);
        return;
      }

      await crearClienteEmpresa(payload);
      showNotification("Éxito", "Cliente creado", "success");

      setTimeout(() => {
        reset(valoresIniciales);
        navigate("/adminPanel/clientes");
      }, 2500);
    } catch (error) {
      const mensaje = error?.fieldErrors
        ? Object.values(error.fieldErrors).flat().join("\n")
        : error.message || "Error al guardar cliente";

      showNotification("Error", mensaje, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loadingClient) {
    return <div className="container w-full mt-1">Cargando cliente...</div>;
  }

  return (
    <div className="container mt-1 w-full rounded-md border border-orange-500">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full mx-auto rounded-md p-8 shadow-md"
      >
        <h2 className="mb-6 text-xl font-bold text-gray-700 dark:text-gray-200">
          {isEdit ? "Editar cliente" : "Nuevo cliente"}
        </h2>

        {isEdit && clientNumber !== null && (
          <div className="mb-4 rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800">
            Numero de cliente: <strong>{clientNumber}</strong>
          </div>
        )}

        {[
          ["Nombre", "nombre"],
          ["Dirección", "direccion"],
          ["Población", "poblacion"],
          ["Provincia", "provincia"],
          ["Codigo Postal", "codigo_postal"],
        ].map(([label, field]) => (
          <div key={field} className="mb-4">
            <label className="mb-2 block text-sm font-bold">{label}</label>
            <input
              type="text"
              className="w-full rounded-md border border-orange-500 px-3 py-2"
              {...register(field, {
                required: `El campo ${label} es obligatorio`,
                ...(field === "codigo_postal"
                  ? {
                      pattern: {
                        value: /^\d{5}$/,
                        message: "El codigo postal debe tener 5 numeros",
                      },
                    }
                  : {}),
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
          <label className="mb-2 block text-sm font-bold">DNI</label>
          <input
            type="text"
            disabled={isEdit && clientNumber === "00000"}
            className="w-full rounded-md border border-orange-500 px-3 py-2"
            {...register("dni", {
              required:
                isEdit && clientNumber === "00000"
                  ? false
                  : "El campo DNI es obligatorio",
              pattern:
                isEdit && clientNumber === "00000"
                  ? undefined
                  : {
                      value: /^[0-9]{8}[A-Za-z]$/,
                      message: "El DNI debe tener 8 numeros y 1 letra",
                    },
            })}
          />
          {isEdit && clientNumber === "00000" && (
            <p className="mt-1 text-sm text-amber-700">
              El DNI del cliente contado (nº 00000) no se puede modificar.
            </p>
          )}
          {errors.dni && (
            <p className="mt-1 text-sm text-red-500">{errors.dni.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold">Email</label>
          <input
            type="email"
            className="w-full rounded-md border border-orange-500 px-3 py-2"
            placeholder="Opcional"
            {...register("email", {
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

        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold">Telefono</label>
          <input
            type="text"
            className="w-full rounded-md border border-orange-500 px-3 py-2"
            placeholder="Opcional"
            {...register("telefono", {
              pattern: {
                value: /^$|^[0-9+ ]{9,15}$/,
                message: "Telefono no válido",
              },
            })}
          />
          {errors.telefono && (
            <p className="mt-1 text-sm text-red-500">
              {errors.telefono.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold">Telefono 2</label>
          <input
            type="text"
            className="w-full rounded-md border border-orange-500 px-3 py-2"
            placeholder="Opcional"
            {...register("telefono2", {
              pattern: {
                value: /^$|^[0-9+ ]{9,15}$/,
                message: "Telefono 2 no válido",
              },
            })}
          />
          {errors.telefono2 && (
            <p className="mt-1 text-sm text-red-500">
              {errors.telefono2.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-md bg-orange-500 py-2 text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {saving
            ? "Guardando..."
            : isEdit
              ? "Guardar cambios"
              : "Añadir cliente"}
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
