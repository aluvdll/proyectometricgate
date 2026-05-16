import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { NotificationModal } from "../../components/modals/NotificationModal";

const initialForm = {
  fiscal_name: "",
  commercial_name: "",
  cif_nif: "",
  email: "",
  address: "",
  phone: "",
  phone2: "",
  city: "",
  province: "",
  postal_code: "",
  admin_name: "",
  admin_email: "",
  admin_email_confirmation: "",
  admin_password: "",
  admin_password_confirmation: "",
  admin_dni: "",
  admin_phone: "",
  admin_address: "",
  admin_city: "",
  admin_province: "",
};

const fieldClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-orange-400 dark:focus:ring-orange-500/20";

const fieldErrorClassName =
  "w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-red-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-red-400 dark:focus:ring-red-500/20";

function buildErrorMessage(error, fallback) {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  if (Array.isArray(error)) {
    return error.filter(Boolean).join("\n");
  }

  if (typeof error === "object") {
    return Object.values(error).flat().filter(Boolean).join("\n");
  }

  return fallback;
}

export default function RegistroEmpresaPago() {
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyType, setNotifyType] = useState("success");

  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || "";
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setError: setFormError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: initialForm,
    mode: "onTouched",
  });

  const showNotification = (title, message, type = "success") => {
    setNotifyTitle(title);
    setNotifyMessage(message);
    setNotifyType(type);
    setNotifyVisible(true);

    setTimeout(() => {
      setNotifyVisible(false);
    }, 3200);
  };

  useEffect(() => {
    const cargarInfo = async () => {
      if (!token) {
        const message = "Falta el token de registro en el enlace.";
        showNotification("Error", message, "error");
        setLoadingInfo(false);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      try {
        const response = await fetch(
          `${apiUrl}/api/checkout/registration/info?token=${encodeURIComponent(token)}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "No se pudo validar el enlace.");
        }

        setPaymentInfo(data);
        setValue("admin_email", data?.customer_email || "");
        setValue("admin_email_confirmation", data?.customer_email || "");
      } catch (err) {
        const message =
          err?.message || "No se pudo validar el enlace de registro.";
        showNotification("Error", message, "error");
      } finally {
        setLoadingInfo(false);
      }
    };

    void cargarInfo();
  }, [token, setValue]);

  const onSubmit = async (data) => {
    clearErrors();
    setSubmitting(true);

    if (!token) {
      const message = "Enlace de registro invalido.";
      showNotification("Error", message, "error");
      setSubmitting(false);
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(
        `${apiUrl}/api/checkout/registration/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            ...data,
          }),
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        const message =
          responseData?.message ||
          responseData?.error ||
          "No se pudo completar el registro.";

        if (responseData?.errors) {
          Object.entries(responseData.errors).forEach(([field, messages]) => {
            setFormError(field, {
              type: "server",
              message: buildErrorMessage(messages, message),
            });
          });
        }

        throw new Error(message);
      }

      showNotification(
        "Éxito",
        responseData?.message || "Registro completado correctamente.",
        "success",
      );

      reset(initialForm);
      if (paymentInfo?.customer_email) {
        setValue("admin_email", paymentInfo.customer_email);
        setValue("admin_email_confirmation", paymentInfo.customer_email);
      }
    } catch (err) {
      const message = err?.message || "No se pudo completar el registro.";
      showNotification("Error", message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const renderFieldError = (fieldName) => {
    const fieldError = errors?.[fieldName];

    if (!fieldError) {
      return null;
    }

    return (
      <p className="mt-1 text-sm text-red-500 dark:text-red-300">
        {fieldError.message}
      </p>
    );
  };

  if (loadingInfo) {
    return (
      <section className="mt-16 min-h-[calc(100vh-4rem)] bg-gray-50 px-6 py-10 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          Validando enlace de registro...
        </div>
        {notifyVisible && (
          <NotificationModal
            title={notifyTitle}
            message={notifyMessage}
            type={notifyType}
          />
        )}
      </section>
    );
  }

  return (
    <section className="mt-16 min-h-[calc(100vh-4rem)] bg-gray-50 px-6 py-10 dark:bg-gray-950">
      {notifyVisible && (
        <NotificationModal
          title={notifyTitle}
          message={notifyMessage}
          type={notifyType}
        />
      )}

      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Registro de empresa
        </h1>

        {paymentInfo && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Pago confirmado para {paymentInfo.plan_name} (
            {paymentInfo.amount_euros} EUR) con el email{" "}
            {paymentInfo.customer_email}.
          </p>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
          noValidate
        >
          <div>
            <input
              placeholder="Nombre fiscal"
              className={
                errors.fiscal_name ? fieldErrorClassName : fieldClassName
              }
              {...register("fiscal_name", {
                required: "El nombre fiscal es obligatorio",
              })}
            />
            {renderFieldError("fiscal_name")}
          </div>

          <div>
            <input
              placeholder="Nombre comercial (opcional)"
              className={fieldClassName}
              {...register("commercial_name")}
            />
          </div>

          <div>
            <input
              placeholder="CIF/NIF"
              className={errors.cif_nif ? fieldErrorClassName : fieldClassName}
              {...register("cif_nif", {
                required: "El CIF/NIF es obligatorio",
              })}
            />
            {renderFieldError("cif_nif")}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email de empresa"
              className={errors.email ? fieldErrorClassName : fieldClassName}
              {...register("email", {
                required: "El email de empresa es obligatorio",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "El email de empresa no es válido",
                },
              })}
            />
            {renderFieldError("email")}
          </div>

          <div className="md:col-span-2">
            <input
              placeholder="Dirección"
              className={errors.address ? fieldErrorClassName : fieldClassName}
              {...register("address", {
                required: "La dirección es obligatoria",
              })}
            />
            {renderFieldError("address")}
          </div>

          <div>
            <input
              placeholder="Teléfono"
              className={errors.phone ? fieldErrorClassName : fieldClassName}
              {...register("phone", {
                required: "El teléfono es obligatorio",
                pattern: {
                  value: /^$|^[0-9+ ]{9,15}$/,
                  message: "El teléfono no es válido",
                },
              })}
            />
            {renderFieldError("phone")}
          </div>

          <div>
            <input
              placeholder="Teléfono secundario (opcional)"
              className={fieldClassName}
              {...register("phone2", {
                pattern: {
                  value: /^$|^[0-9+ ]{9,15}$/,
                  message: "El teléfono secundario no es válido",
                },
              })}
            />
            {renderFieldError("phone2")}
          </div>

          <div>
            <input
              placeholder="Ciudad"
              className={errors.city ? fieldErrorClassName : fieldClassName}
              {...register("city", {
                required: "La ciudad es obligatoria",
              })}
            />
            {renderFieldError("city")}
          </div>

          <div>
            <input
              placeholder="Provincia"
              className={errors.province ? fieldErrorClassName : fieldClassName}
              {...register("province", {
                required: "La provincia es obligatoria",
              })}
            />
            {renderFieldError("province")}
          </div>

          <div>
            <input
              placeholder="Código postal"
              className={
                errors.postal_code ? fieldErrorClassName : fieldClassName
              }
              {...register("postal_code", {
                required: "El código postal es obligatorio",
                pattern: {
                  value: /^\d{5}$/,
                  message: "El código postal debe tener 5 números",
                },
              })}
            />
            {renderFieldError("postal_code")}
          </div>

          <hr className="my-2 md:col-span-2 border-gray-200 dark:border-gray-700" />

          <div>
            <input
              placeholder="Nombre del administrador"
              className={
                errors.admin_name ? fieldErrorClassName : fieldClassName
              }
              {...register("admin_name", {
                required: "El nombre del administrador es obligatorio",
              })}
            />
            {renderFieldError("admin_name")}
          </div>

          <div>
            <input
              placeholder="DNI del administrador"
              className={
                errors.admin_dni ? fieldErrorClassName : fieldClassName
              }
              {...register("admin_dni", {
                required: "El DNI del administrador es obligatorio",
              })}
            />
            {renderFieldError("admin_dni")}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email del administrador"
              className={
                errors.admin_email ? fieldErrorClassName : fieldClassName
              }
              {...register("admin_email", {
                required: "El email del administrador es obligatorio",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "El email del administrador no es válido",
                },
              })}
            />
            {renderFieldError("admin_email")}
          </div>

          <div>
            <input
              type="email"
              placeholder="Confirmar email del administrador"
              className={
                errors.admin_email_confirmation
                  ? fieldErrorClassName
                  : fieldClassName
              }
              {...register("admin_email_confirmation", {
                required: "Debes confirmar el email del administrador",
                validate: (value, values) =>
                  value === values.admin_email ||
                  "Los emails del administrador deben coincidir",
              })}
            />
            {renderFieldError("admin_email_confirmation")}
          </div>

          <div>
            <input
              type="password"
              placeholder="Contraseña del administrador"
              className={
                errors.admin_password ? fieldErrorClassName : fieldClassName
              }
              {...register("admin_password", {
                required: "La contraseña del administrador es obligatoria",
                minLength: {
                  value: 6,
                  message: "La contraseña debe tener al menos 6 caracteres",
                },
              })}
            />
            {renderFieldError("admin_password")}
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirmar contraseña"
              className={
                errors.admin_password_confirmation
                  ? fieldErrorClassName
                  : fieldClassName
              }
              {...register("admin_password_confirmation", {
                required: "Debes confirmar la contraseña",
                validate: (value, values) =>
                  value === values.admin_password ||
                  "Las contraseñas deben coincidir",
              })}
            />
            {renderFieldError("admin_password_confirmation")}
          </div>

          <div>
            <input
              placeholder="Teléfono del administrador (opcional)"
              className={fieldClassName}
              {...register("admin_phone", {
                pattern: {
                  value: /^$|^[0-9+ ]{9,15}$/,
                  message: "El teléfono del administrador no es válido",
                },
              })}
            />
            {renderFieldError("admin_phone")}
          </div>

          <div>
            <input
              placeholder="Ciudad del administrador (opcional)"
              className={fieldClassName}
              {...register("admin_city")}
            />
          </div>

          <div>
            <input
              placeholder="Provincia del administrador (opcional)"
              className={fieldClassName}
              {...register("admin_province")}
            />
          </div>

          <div className="md:col-span-2">
            <input
              placeholder="Dirección del administrador (opcional)"
              className={fieldClassName}
              {...register("admin_address")}
            />
          </div>

          <div className="mt-2 flex flex-wrap gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Guardando..." : "Completar registro"}
            </button>
            <Link
              to="/login"
              className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              Ir a login
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
