import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import {
  actualizarEmpresa,
  darAltaEmpresa,
  darBajaEmpresa,
  obtenerDetalleEmpresa,
  obtenerEmpresas,
  obtenerUsuariosEmpresa,
  reactivarEmpresa,
} from "../../services/panelEmpresas";
import { NotificationModal } from "../../components/modals/NotificationModal";

const formularioInicial = {
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
  max_users: 5,
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

const formularioEdicionInicial = {
  fiscal_name: "",
  commercial_name: "",
  cif_nif: "",
  email: "",
  logo: "",
  address: "",
  phone: "",
  phone2: "",
  city: "",
  province: "",
  postal_code: "",
  max_users: 5,
  active: true,
};

function obtenerMensajeError(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Ha ocurrido un error inesperado";
}

export function SuperAdminPanel() {
  const { token, user } = useAuth();

  const [empresas, setEmpresas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyType, setNotifyType] = useState("success");
  const [empresaUsuariosActiva, setEmpresaUsuariosActiva] = useState(null);
  const [usuariosEmpresa, setUsuariosEmpresa] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [errorUsuarios, setErrorUsuarios] = useState("");
  const [empresaEdicionActiva, setEmpresaEdicionActiva] = useState(null);
  const [cargandoEdicion, setCargandoEdicion] = useState(false);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState("");
  const [logoEdicionNoDisponible, setLogoEdicionNoDisponible] = useState(false);
  const [logoArchivoEdicion, setLogoArchivoEdicion] = useState(null);
  const [previsualizacionLogoEdicion, setPrevisualizacionLogoEdicion] =
    useState("");
  const [formularioEdicion, setFormularioEdicion] = useState(
    formularioEdicionInicial,
  );

  const showNotification = (title, message, type = "success") => {
    setNotifyTitle(title);
    setNotifyMessage(message);
    setNotifyType(type);
    setNotifyVisible(true);
    setTimeout(() => {
      setNotifyVisible(false);
    }, 2500);
  };

  // Aqui inicializo React Hook Form con los valores por defecto de mi formulario.
  const {
    // Con register conecto cada input al estado interno del formulario.
    register,
    // Con handleSubmit valido todo y solo si pasa ejecuto crearEmpresa.
    handleSubmit,
    // Con reset limpio el formulario cuando el alta sale bien.
    reset,
    // Con watch puedo leer valores en vivo si necesito reglas entre campos.
    watch,
    // Aqui leo los errores por campo para pintar los mensajes debajo del input.
    formState: { errors },
  } = useForm({
    defaultValues: formularioInicial,
  });

  const rolSesion = user?.role ?? localStorage.getItem("role");
  const tokenSesion = token ?? localStorage.getItem("token");
  const esSuperAdmin = rolSesion === "super_admin";

  const totalEmpresas = empresas.length;
  const totalActivas = empresas.filter((empresa) => empresa.active).length;

  const cargarEmpresas = async () => {
    if (!tokenSesion) {
      setCargando(false);
      showNotification("Error", "No autorizado", "error");
      return;
    }
    try {
      setCargando(true);
      setError("");
      const lista = await obtenerEmpresas(tokenSesion);
      setEmpresas(lista);
    } catch (e) {
      setError(obtenerMensajeError(e));
      showNotification("Error", obtenerMensajeError(e), "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!tokenSesion) {
      setCargando(false);
      return;
    }

    void cargarEmpresas();
  }, [tokenSesion]);

  // Este metodo solo se ejecuta si React Hook Form valida bien todos los campos.
  const crearEmpresa = (data) => {
    if (!tokenSesion) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    darAltaEmpresa(tokenSesion, data)
      .then(() => {
        showNotification("Éxito", "Empresa creada correctamente", "success");

        reset(formularioInicial);
        setMostrarFormulario(false);
        return cargarEmpresas();
      })
      .catch((err) => {
        setError(obtenerMensajeError(err));
        showNotification("Error", obtenerMensajeError(err), "error");
      })
      .finally(() => {
        setGuardando(false);
      });
  };

  const cambiarEstadoEmpresa = async (empresa) => {
    if (!tokenSesion) return;

    try {
      setError("");
      setMensaje("");

      if (empresa.active) {
        await darBajaEmpresa(tokenSesion, empresa.id);
        setMensaje(`Empresa ${empresa.fiscal_name} dada de baja`);
        showNotification(
          "Éxito",
          `Empresa ${empresa.fiscal_name} dada de baja`,
          "baja",
        );
      } else {
        await reactivarEmpresa(tokenSesion, empresa.id);
        setMensaje(`Empresa ${empresa.fiscal_name} reactivada`);
        showNotification(
          "Éxito",
          `Empresa ${empresa.fiscal_name} reactivada`,
          "success",
        );
      }

      await cargarEmpresas();
    } catch (err) {
      setError(obtenerMensajeError(err));
      showNotification("Error", obtenerMensajeError(err), "error");
    }
  };

  const abrirUsuariosEmpresa = async (empresa) => {
    if (!tokenSesion) return;

    setEmpresaUsuariosActiva(empresa);
    setUsuariosEmpresa([]);
    setErrorUsuarios("");
    setCargandoUsuarios(true);

    try {
      const listaUsuarios = await obtenerUsuariosEmpresa(
        tokenSesion,
        empresa.id,
      );
      setUsuariosEmpresa(listaUsuarios);
    } catch (err) {
      const mensajeError = obtenerMensajeError(err);
      setErrorUsuarios(mensajeError);
      showNotification("Error", mensajeError, "error");
    } finally {
      setCargandoUsuarios(false);
    }
  };

  const cerrarUsuariosEmpresa = () => {
    setEmpresaUsuariosActiva(null);
    setUsuariosEmpresa([]);
    setErrorUsuarios("");
    setCargandoUsuarios(false);
  };

  // Abre el modal de edición y carga los datos completos de la empresa desde backend.
  const abrirEdicionEmpresa = async (empresa) => {
    if (!tokenSesion) return;

    setEmpresaEdicionActiva(empresa);
    setErrorEdicion("");
    setLogoEdicionNoDisponible(false);
    setLogoArchivoEdicion(null);
    setPrevisualizacionLogoEdicion("");
    setCargandoEdicion(true);

    try {
      const detalle = await obtenerDetalleEmpresa(tokenSesion, empresa.id);

      setFormularioEdicion({
        fiscal_name: detalle?.fiscal_name ?? "",
        commercial_name: detalle?.commercial_name ?? "",
        cif_nif: detalle?.cif_nif ?? "",
        email: detalle?.email ?? "",
        logo: detalle?.logo ?? "",
        address: detalle?.address ?? "",
        phone: detalle?.phone ?? "",
        phone2: detalle?.phone2 ?? "",
        city: detalle?.city ?? "",
        province: detalle?.province ?? "",
        postal_code: detalle?.postal_code ?? "",
        max_users: detalle?.max_users ?? 5,
        active: Boolean(detalle?.active),
      });
    } catch (err) {
      const mensajeError = obtenerMensajeError(err);
      setErrorEdicion(mensajeError);
      showNotification("Error", mensajeError, "error");
    } finally {
      setCargandoEdicion(false);
    }
  };

  // Cierra modal y deja el formulario listo para una futura edición.
  const cerrarEdicionEmpresa = () => {
    setEmpresaEdicionActiva(null);
    setErrorEdicion("");
    setLogoEdicionNoDisponible(false);
    setLogoArchivoEdicion(null);
    setPrevisualizacionLogoEdicion("");
    setCargandoEdicion(false);
    setGuardandoEdicion(false);
    setFormularioEdicion(formularioEdicionInicial);
  };

  // Actualiza cualquier campo del formulario de edición de forma genérica.
  const cambiarCampoEdicion = (campo, valor) => {
    if (campo === "logo") {
      setLogoEdicionNoDisponible(false);
    }

    setFormularioEdicion((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // Aqui cargo una imagen desde el equipo para usarla como nuevo logo.
  const cambiarArchivoLogoEdicion = (event) => {
    const archivo = event.target.files?.[0] ?? null;

    setLogoArchivoEdicion(archivo);
    setLogoEdicionNoDisponible(false);

    if (!archivo) {
      setPrevisualizacionLogoEdicion("");
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      setPrevisualizacionLogoEdicion(String(lector.result || ""));
    };
    lector.onerror = () => {
      setPrevisualizacionLogoEdicion("");
      setLogoEdicionNoDisponible(true);
    };
    lector.readAsDataURL(archivo);
  };

  // Envía cambios al backend y recarga listado para reflejar valores actualizados.
  const guardarEdicionEmpresa = async (event) => {
    event.preventDefault();
    if (!tokenSesion || !empresaEdicionActiva) return;

    setGuardandoEdicion(true);
    setErrorEdicion("");

    try {
      await actualizarEmpresa(
        tokenSesion,
        empresaEdicionActiva.id,
        {
          fiscal_name: formularioEdicion.fiscal_name,
          commercial_name: formularioEdicion.commercial_name,
          cif_nif: formularioEdicion.cif_nif,
          email: formularioEdicion.email,
          logo: formularioEdicion.logo,
          address: formularioEdicion.address,
          phone: formularioEdicion.phone,
          phone2: formularioEdicion.phone2,
          city: formularioEdicion.city,
          province: formularioEdicion.province,
          postal_code: formularioEdicion.postal_code,
          max_users: Number(formularioEdicion.max_users || 1),
          active: Boolean(formularioEdicion.active),
        },
        logoArchivoEdicion,
      );

      showNotification("Éxito", "Empresa actualizada correctamente", "success");
      await cargarEmpresas();
      cerrarEdicionEmpresa();
    } catch (err) {
      const mensajeError = obtenerMensajeError(err);
      setErrorEdicion(mensajeError);
      showNotification("Error", mensajeError, "error");
    } finally {
      setGuardandoEdicion(false);
    }
  };

  if (!esSuperAdmin) {
    return (
      <div className="mt-24 px-6">
        <div className="max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          No tienes permisos para ver este panel.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-20 px-4 pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-orange-200 bg-orange-50 p-6 shadow-sm dark:border-orange-800 dark:bg-orange-950/30">
          <h1 className="text-2xl font-bold text-orange-800 dark:text-orange-200">
            Panel de Empresas (SuperAdmin)
          </h1>
          <p className="mt-2 text-sm text-orange-800 dark:text-orange-300">
            Gestion simple de empresas: ver, crear, dar de baja y reactivar.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-800">
              <p className="text-xs text-gray-500 dark:text-gray-300">
                Total empresas
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalEmpresas}
              </p>
            </div>

            <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-800">
              <p className="text-xs text-gray-500 dark:text-gray-300">
                Empresas activas
              </p>
              <p className="text-2xl font-bold text-green-600">
                {totalActivas}
              </p>
            </div>

            <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-800">
              <p className="text-xs text-gray-500 dark:text-gray-300">
                Empresas inactivas
              </p>
              <p className="text-2xl font-bold text-red-600">
                {totalEmpresas - totalActivas}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Empresas registradas
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void cargarEmpresas()}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 dark:border-slate-600 dark:text-gray-100 dark:hover:bg-slate-800"
              >
                Actualizar
              </button>
              <button
                type="button"
                onClick={() => setMostrarFormulario((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                <span className="text-base leading-none">+</span>
                {mostrarFormulario ? "Cerrar" : "Nueva empresa"}
              </button>
            </div>
          </div>

          {cargando ? (
            <p className="text-gray-600 dark:text-gray-300">
              Cargando empresas...
            </p>
          ) : empresas.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              Todavia no hay empresas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-sm dark:text-gray-100">
                <thead>
                  <tr className="border-b bg-gray-50 text-left dark:border-slate-700 dark:bg-slate-800">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Nombre fiscal</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Ciudad</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empresas.map((empresa) => (
                    <tr
                      key={empresa.id}
                      className="border-b dark:border-slate-700"
                    >
                      <td className="px-3 py-2">{empresa.id}</td>
                      <td className="px-3 py-2">{empresa.fiscal_name}</td>
                      <td className="px-3 py-2">{empresa.email}</td>
                      <td className="px-3 py-2">{empresa.city}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            empresa.active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {empresa.active ? "Activa" : "Baja"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => void abrirUsuariosEmpresa(empresa)}
                            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Usuarios
                          </button>
                          <button
                            onClick={() => void abrirEdicionEmpresa(empresa)}
                            className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                          >
                            Editar empresa
                          </button>
                          <button
                            onClick={() => void cambiarEstadoEmpresa(empresa)}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white ${
                              empresa.active
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {empresa.active ? "Dar de baja" : "Reactivar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {empresaUsuariosActiva && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-4xl rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Usuarios de {empresaUsuariosActiva.fiscal_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    Empresa ID: {empresaUsuariosActiva.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cerrarUsuariosEmpresa}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-slate-600 dark:text-gray-100 dark:hover:bg-slate-800"
                >
                  Cerrar
                </button>
              </div>

              {cargandoUsuarios ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Cargando usuarios...
                </p>
              ) : errorUsuarios ? (
                <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                  {errorUsuarios}
                </p>
              ) : usuariosEmpresa.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Esta empresa no tiene usuarios.
                </p>
              ) : (
                <div className="max-h-[60vh] overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-sm dark:text-gray-100">
                    <thead>
                      <tr className="border-b bg-gray-50 text-left dark:border-slate-700 dark:bg-slate-800">
                        <th className="px-3 py-2">ID</th>
                        <th className="px-3 py-2">Nombre</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Rol</th>
                        <th className="px-3 py-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuariosEmpresa.map((usuario) => (
                        <tr
                          key={usuario.id}
                          className="border-b dark:border-slate-700"
                        >
                          <td className="px-3 py-2">{usuario.id}</td>
                          <td className="px-3 py-2">{usuario.name}</td>
                          <td className="px-3 py-2">{usuario.email}</td>
                          <td className="px-3 py-2">{usuario.role}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                usuario.active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {usuario.active ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {empresaEdicionActiva && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-4xl rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Editar empresa: {empresaEdicionActiva.fiscal_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    Empresa ID: {empresaEdicionActiva.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cerrarEdicionEmpresa}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-slate-600 dark:text-gray-100 dark:hover:bg-slate-800"
                >
                  Cerrar
                </button>
              </div>

              {cargandoEdicion ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Cargando datos de empresa...
                </p>
              ) : (
                <form
                  onSubmit={guardarEdicionEmpresa}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Nombre fiscal
                    </label>
                    <input
                      value={formularioEdicion.fiscal_name}
                      onChange={(e) =>
                        cambiarCampoEdicion("fiscal_name", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Nombre comercial
                    </label>
                    <input
                      value={formularioEdicion.commercial_name}
                      onChange={(e) =>
                        cambiarCampoEdicion("commercial_name", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      CIF/NIF
                    </label>
                    <input
                      value={formularioEdicion.cif_nif}
                      onChange={(e) =>
                        cambiarCampoEdicion("cif_nif", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formularioEdicion.email}
                      onChange={(e) =>
                        cambiarCampoEdicion("email", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Dirección
                    </label>
                    <input
                      value={formularioEdicion.address}
                      onChange={(e) =>
                        cambiarCampoEdicion("address", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Teléfono principal
                    </label>
                    <input
                      value={formularioEdicion.phone}
                      onChange={(e) =>
                        cambiarCampoEdicion("phone", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Teléfono secundario
                    </label>
                    <input
                      value={formularioEdicion.phone2}
                      onChange={(e) =>
                        cambiarCampoEdicion("phone2", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Ciudad
                    </label>
                    <input
                      value={formularioEdicion.city}
                      onChange={(e) =>
                        cambiarCampoEdicion("city", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Provincia
                    </label>
                    <input
                      value={formularioEdicion.province}
                      onChange={(e) =>
                        cambiarCampoEdicion("province", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Código postal
                    </label>
                    <input
                      value={formularioEdicion.postal_code}
                      onChange={(e) =>
                        cambiarCampoEdicion("postal_code", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Máximo usuarios
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formularioEdicion.max_users}
                      onChange={(e) =>
                        cambiarCampoEdicion("max_users", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Logo (archivo de imagen)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={cambiarArchivoLogoEdicion}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                    {formularioEdicion.logo && !logoArchivoEdicion && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                        Logo actual guardado: {formularioEdicion.logo}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                      Previsualización del logo
                    </p>
                    <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 dark:border-slate-600 dark:bg-slate-800">
                      {!previsualizacionLogoEdicion &&
                      !formularioEdicion.logo ? (
                        <p className="text-xs text-gray-500 dark:text-gray-300">
                          Sin logo
                        </p>
                      ) : logoEdicionNoDisponible ? (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          No se pudo cargar la imagen seleccionada.
                        </p>
                      ) : (
                        <img
                          src={
                            previsualizacionLogoEdicion ||
                            formularioEdicion.logo
                          }
                          alt="Previsualización del logo de empresa"
                          onError={() => setLogoEdicionNoDisponible(true)}
                          onLoad={() => setLogoEdicionNoDisponible(false)}
                          className="max-h-20 w-auto object-contain"
                        />
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                      <input
                        type="checkbox"
                        checked={Boolean(formularioEdicion.active)}
                        onChange={(e) =>
                          cambiarCampoEdicion("active", e.target.checked)
                        }
                      />
                      Empresa activa
                    </label>
                  </div>

                  {errorEdicion && (
                    <div className="md:col-span-2 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                      {errorEdicion}
                    </div>
                  )}

                  <div className="md:col-span-2 flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={guardandoEdicion}
                      className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {guardandoEdicion
                        ? "Guardando cambios..."
                        : "Guardar cambios"}
                    </button>

                    <button
                      type="button"
                      onClick={cerrarEdicionEmpresa}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-slate-600 dark:text-gray-100 dark:hover:bg-slate-800"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {mostrarFormulario && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Formulario de alta de empresa
            </h2>

            <form
              // Paso crearEmpresa por handleSubmit para que React Hook Form controle la validacion.
              onSubmit={handleSubmit(crearEmpresa)}
              className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div>
                <label
                  htmlFor="fiscal_name"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Nombre fiscal
                </label>
                <input
                  id="fiscal_name"
                  // Aqui registro el input y defino sus reglas de validacion.
                  {...register("fiscal_name", {
                    required: "El nombre fiscal es obligatorio",
                  })}
                  className={`w-full rounded-lg border px-3 py-2 dark:bg-slate-800 dark:text-white ${errors.fiscal_name ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
                />
                {/* Si este campo falla, aqui muestro su mensaje de error */}
                {errors.fiscal_name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.fiscal_name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="commercial_name"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Nombre comercial
                </label>
                <input
                  id="commercial_name"
                  {...register("commercial_name")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="cif_nif"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  CIF/NIF
                </label>
                <input
                  id="cif_nif"
                  {...register("cif_nif", {
                    required: "El CIF/NIF es obligatorio",
                  })}
                  className={`w-full rounded-lg border px-3 py-2 dark:bg-slate-800 dark:text-white ${errors.cif_nif ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
                />
                {errors.cif_nif && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.cif_nif.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Email empresa
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "El email de la empresa es obligatorio",
                  })}
                  className={`w-full rounded-lg border px-3 py-2 dark:bg-slate-800 dark:text-white ${errors.email ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Direccion
                </label>
                <input
                  id="address"
                  {...register("address", {
                    required: "La direccion es obligatoria",
                  })}
                  className={`w-full rounded-lg border px-3 py-2 dark:bg-slate-800 dark:text-white ${errors.address ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Telefono principal
                </label>
                <input
                  id="phone"
                  {...register("phone", {
                    required: "El telefono es obligatorio",
                    minLength: {
                      value: 9,
                      message: "Telefono demasiado corto",
                    },
                  })}
                  className={`w-full rounded-lg border px-3 py-2 dark:bg-slate-800 dark:text-white ${errors.phone ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Ciudad
                </label>
                <input
                  id="city"
                  {...register("city", {
                    required: "La ciudad es obligatoria",
                  })}
                  className={`w-full rounded-lg border px-3 py-2 dark:bg-slate-800 dark:text-white ${errors.city ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="province"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Provincia
                </label>
                <input
                  id="province"
                  {...register("province", {
                    required: "La provincia es obligatoria",
                  })}
                  className={`w-full rounded-lg border px-3 py-2 dark:bg-slate-800 dark:text-white ${errors.province ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
                />
                {errors.province && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.province.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="postal_code"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Codigo postal
                </label>
                <input
                  id="postal_code"
                  {...register("postal_code", {
                    required: "El codigo postal es obligatorio",
                  })}
                  className={`w-full rounded-lg border px-3 py-2 dark:bg-slate-800 dark:text-white ${errors.postal_code ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
                />
                {errors.postal_code && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.postal_code.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 mt-2 border-t pt-3 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Datos del administrador de la empresa
                </h3>
              </div>

              <div>
                <label
                  htmlFor="admin_name"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Nombre admin
                </label>
                <input
                  id="admin_name"
                  {...register("admin_name", {
                    required: "El nombre del admin es obligatorio",
                  })}
                  className={`w-full rounded-lg border px-3 py-2 dark:bg-slate-800 dark:text-white ${errors.admin_name ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
                />
                {errors.admin_name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.admin_name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="admin_dni"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  DNI admin
                </label>
                <input
                  id="admin_dni"
                  {...register("admin_dni", {
                    required: "El DNI del admin es obligatorio",
                  })}
                  className={`w-full rounded-lg border px-3 py-2 dark:bg-slate-800 dark:text-white ${errors.admin_dni ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
                />
                {errors.admin_dni && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.admin_dni.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="admin_email"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Email admin
                </label>
                <input
                  id="admin_email"
                  type="email"
                  {...register("admin_email", {
                    required: "El email del admin es obligatorio",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Email del admin no es valido",
                    },
                  })}
                  className={`w-full rounded-lg border px-3 py-2 dark:bg-slate-800 dark:text-white ${errors.admin_email ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
                />
                {errors.admin_email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.admin_email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="admin_email_confirmation"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Confirmar email admin
                </label>
                <input
                  id="admin_email_confirmation"
                  type="email"
                  {...register("admin_email_confirmation", {
                    required: "Debes confirmar el email del admin",
                    validate: (value) =>
                      value === watch("admin_email") ||
                      "Los emails no coinciden",
                  })}
                  className={`w-full rounded-lg border px-3 py-2 dark:bg-slate-800 dark:text-white ${errors.admin_email_confirmation ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
                />
                {errors.admin_email_confirmation && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.admin_email_confirmation.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="admin_password"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Contrasena admin
                </label>
                <input
                  id="admin_password"
                  type="password"
                  {...register("admin_password", {
                    required: "La contrasena del admin es obligatoria",
                    minLength: { value: 6, message: "Minimo 6 caracteres" },
                  })}
                  className={`w-full rounded-lg border px-3 py-2 dark:bg-slate-800 dark:text-white ${errors.admin_password ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
                />
                {errors.admin_password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.admin_password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="admin_password_confirmation"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Confirmar contrasena admin
                </label>
                <input
                  id="admin_password_confirmation"
                  type="password"
                  {...register("admin_password_confirmation", {
                    required: "Debes confirmar la contrasena del admin",
                    validate: (value) =>
                      value === watch("admin_password") ||
                      "Las contrasenas no coinciden",
                  })}
                  className={`w-full rounded-lg border px-3 py-2 dark:bg-slate-800 dark:text-white ${errors.admin_password_confirmation ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
                />
                {errors.admin_password_confirmation && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.admin_password_confirmation.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={guardando}
                  className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {guardando ? "Guardando..." : "Crear empresa"}
                </button>
              </div>
            </form>
          </section>
        )}

        {notifyVisible && (
          <NotificationModal
            title={notifyTitle}
            message={notifyMessage}
            type={notifyType}
          />
        )}
      </div>
    </div>
  );
}
