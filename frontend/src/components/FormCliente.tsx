// FormCliente.tsx
import axios from "axios";
import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  mode: "create" | "edit";
  userId?: string;
};

export function FormCliente({ mode, userId }: Props): JSX.Element {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido1: "",
    apellido2: "",
    telefono: "",
    dni: "",
    email: "",
    calle: "",
    poblacion: "",
    provincia: "",
    codigo_postal: "",
    password: "",
    confirmPassword: "",
    pais:"",
  });

  const isEdit = mode === "edit";

  // 🔹 Cargar cliente si es edición
  useEffect(() => {
    if (isEdit && userId) {
      axios
        .get(`http://localhost:3001/clientes/${userId}`)
        .then((res) => {
          setFormData({
            ...res.data,
            password: "",
            confirmPassword: "",
          });
        })
        .catch(() => alert("Error cargando cliente"));
    }
  }, [isEdit, userId]);

  // 🔹 Manejar cambios en inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔹 Manejar submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isEdit && formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      if (isEdit && userId) {
        // Actualizar cliente
        await axios.put(`http://localhost:3001/clientes/${userId}`, {
          nombre: formData.nombre,
          apellido1: formData.apellido1,
          apellido2: formData.apellido2,
          email: formData.email,
          telefono: formData.telefono,
          dni: formData.dni,
          calle: formData.calle,
          poblacion: formData.poblacion,
          provincia: formData.provincia,
          codigo_postal: formData.codigo_postal,
          pais: formData.pais,
        });

        alert("cliente actualizado");
        navigate("/adminPanel/usuarios");
      } else {
        // Crear cliente
        await axios.post("http://localhost:3001/clientes", {
          nombre: formData.nombre,
          apellido1: formData.apellido1,
          apellido2: formData.apellido2,
          email: formData.email,
          password: formData.password,
          telefono: formData.telefono,
          dni: formData.dni,
          calle: formData.calle,
          poblacion: formData.poblacion,
          provincia: formData.provincia,
          codigo_postal: formData.codigo_postal,
          pais: formData.pais,

        });

        alert("cliente creado");
        // Reset del formulario
        setFormData({
          nombre: "",
          apellido1: "",
          apellido2: "",
          email: "",
          password: "",
          confirmPassword: "",
          telefono: "",
          dni: "",
          calle: "",
          poblacion: "",
          provincia: "",
          codigo_postal: "",
          pais:"",
        });
      }
    } catch {
      alert("Error al guardar cliente");
    }
  };

  return (
    <div className="container w-full mt-1">
      <form
        className="w-full mx-auto p-4 rounded-md border dark:border-orange-500"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold mb-6 * text-gray-700 dark:text-gray-200">
          {isEdit ? "Editar cliente" : "Nuevo cliente"}
        </h2>

        {/* Nombre */}
        <div className="mb-4">
          <label className="block  text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Nombre
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-orange-500  text-gray-700 dark:text-gray-50"
            required
          />
        </div>

        {/* Primer Apellido */}
        <div className="mb-4">
          <label className="block  text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Primer Apellido
          </label>
          <input
            type="text"
            name="apellido1"
            value={formData.apellido1}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-orange-500  text-gray-700 dark:text-gray-50"
            required
          />
        </div>

        {/* Segundo Apellido */}
        <div className="mb-4">
          <label className="block  text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Segundo Apellido
          </label>
          <input
            type="text"
            name="apellido2"
            value={formData.apellido2}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-orange-500 text-gray-700 dark:text-gray-50"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block  text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-orange-500 text-gray-700 dark:text-gray-50"
            required
            disabled={isEdit} // opcional: no dejar cambiar email en edición
          />
        </div>

        {/* telefono */}
        <div className="mb-4">
          <label className="block  text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Telefono
          </label>
          <input
            type="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-orange-500 text-gray-700 dark:text-gray-50"
            required
            // disabled={!isEdit} // opcional: no dejar cambiar email en edición
          />
        </div>
        {/* dni */} 
        <div className="mb-4">
          <label className="block  text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            DNI
          </label>
          <input
            type="dni"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-orange-500 text-gray-700 dark:text-gray-50"
            required
            // disabled={!isEdit} // opcional: no dejar cambiar email en edición
          />
        </div>
        {/* calle */}
        <div className="mb-4">
          <label className="block  text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Calle
          </label>
          <input
            type="text"
            name="calle"
            value={formData.calle}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-orange-500 text-gray-700 dark:text-gray-50"
            required

          />
        </div>

        {/* poblacion */}
        <div className="mb-4">
          <label className="block  text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Poblacion
          </label>
          <input

            type="text"
            name="poblacion"
            value={formData.poblacion}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-orange-500 text-gray-700 dark:text-gray-200"
            required
 
          />
        </div>
        {/* provincia */}
        <div className="mb-4">
          <label className="block  text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Provincia
          </label>
          <input
            type="text"
            name="provincia"
            value={formData.provincia}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-orange-500 text-gray-700 dark:text-gray-50"
            required

          />
        </div>
        {/* codigo_postal */}
        <div className="mb-4">
          <label className="block  text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Codigo Postal
          </label>
          <input
            type="text"
            name="codigo_postal"
            value={formData.codigo_postal}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-orange-500 text-gray-700 dark:text-gray-50"
            required
    
          />
        </div>

        {/* Password solo en creación */}
        {!isEdit && (
          <>
            <div className="mb-4">
              <label className="block  text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-orange-500 text-gray-700 dark:text-gray-50"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                Confirmar Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-orange-500 text-gray-700 dark:text-gray-50"
                required
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2 rounded-md"
        >
          {isEdit ? "Guardar cambios" : "Añadir cliente"}
        </button>
      </form>
    </div>
  );
}
