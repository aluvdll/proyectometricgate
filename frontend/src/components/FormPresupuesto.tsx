// src/components/FormPresupuesto.tsx
import axios from "axios";
import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ClienteModal } from "./ClienteModal";
import { ArticuloModal } from "./ArticuloModal";
import type { Articulo } from "../types/Articulo";
import type { Cliente } from "../types/Cliente";
import type { ItemBackend } from "../types/ItemBackend";

type Item = {
  articulo_id: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  ancho?: number | null;
  alto?: number | null;
};

type Props = {
  mode: "create" | "edit";
  presupuestoId?: string;
};

export function FormPresupuesto({ mode, presupuestoId }: Props): JSX.Element {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  /* ===========================
     ESTADOS
  =========================== */
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [cliente, setCliente] = useState<Omit<Cliente, "id">>({
    nombre: "",
    apellido1: "",
    apellido2: "",
    poblacion: "",
    provincia: "",
    calle: "",
    codigo_postal: "",
    pais: "",
    telefono: "",
    correo_electronico: "",
    dni: "",
  });

  const [formData, setFormData] = useState({
    numero_presupuesto: "",
    cliente_id: "",
    empleado_id: userId ? String(userId) : "",
    estado: "pendiente",
    subtotal: 0,
    iva: 0,
    total: 0,
    observaciones: "",
    ...cliente,
  });

  const [items, setItems] = useState<Item[]>([
    { articulo_id: "", descripcion: "", cantidad: 1, precio_unitario: 0 },
  ]);

  const [isClienteModalOpen, setClienteModalOpen] = useState(false);
  const [isArticuloModalOpen, setArticuloModalOpen] = useState(false);
  const [selectedArticuloIndex, setSelectedArticuloIndex] = useState<number | null>(null);

  const isClienteEditable = formData.cliente_id === "99999";

  /* ===========================
     CARGA INICIAL
  =========================== */
useEffect(() => {
  const loadData = async () => {
    try {
      // Cargar clientes y artículos
      const [clientesRes, articulosRes] = await Promise.all([
        axios.get("http://localhost:3001/clientes"),
        axios.get("http://localhost:3001/articulos"),
      ]);

      setClientes(clientesRes.data);
      setArticulos(articulosRes.data);

      // Si es edición y hay presupuestoId, cargar presupuesto y items
      if (isEdit && presupuestoId) {
        // Cargar datos del presupuesto
        const presupuestoRes = await axios.get(`http://localhost:3001/presupuestos/${presupuestoId}`);
        const presu = presupuestoRes.data;

        setFormData((f) => ({
          ...f,
          ...presu,
          cliente_id: String(presu.cliente_id),
          empleado_id: String(presu.empleado_id),
          subtotal: Number(presu.subtotal),
          iva: Number(presu.iva),
          total: Number(presu.total),
        }));

        // Cargar cliente
        if (presu.cliente) {
          setCliente({
            nombre: presu.cliente.nombre || "",
            apellido1: presu.cliente.apellido1 || "",
            apellido2: presu.cliente.apellido2 || "",
            poblacion: presu.cliente.poblacion || "",
            provincia: presu.cliente.provincia || "",
            calle: presu.cliente.calle || "",
            codigo_postal: presu.cliente.codigo_postal || "",
            pais: presu.cliente.pais || "",
            telefono: presu.cliente.telefono || "",
            correo_electronico: presu.cliente.correo_electronico || "",
            dni: presu.cliente.dni || "",
          });
        }

        // Cargar items del detalle-presupuesto
        const itemsRes = await axios.get<ItemBackend[]>(`http://localhost:3001/presupuestodetalles/${presupuestoId}`);
        setItems(
          itemsRes.data.map((i) => {
            // Buscar el artículo completo para generar la descripción
            const art = articulosRes.data.find((a: Articulo) => String(a.id_articulo) === String(i.articulo_id));
            const descripcion = art ? `${art.modelo} - ${art.descripcion}` : i.descripcion || "";

            return {
              articulo_id: String(i.articulo_id),
              descripcion,
              cantidad: Number(i.cantidad),
              precio_unitario: Number(i.precio_unitario),
              ancho: i.ancho !== null ? Number(i.ancho) : null,
              alto: i.alto !== null ? Number(i.alto) : null,
            };
          })
        );
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  };

  loadData();
}, [isEdit, presupuestoId]);



  
  /* ===========================
     ARTÍCULOS
  =========================== */
  const handleArticuloChange = (index: number, field: keyof Item, value: string | number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };

      // Recalcular totales
      const subtotal = copy.reduce((sum, i) => sum + i.cantidad * i.precio_unitario, 0);
      const iva = subtotal * 0.21;
      const total = subtotal + iva;
      setFormData((f) => ({ ...f, subtotal, iva, total }));

      return copy;
    });
  };

  const addArticulo = () => setItems([...items, { articulo_id: "", descripcion: "", cantidad: 1, precio_unitario: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  /* ===========================
     SUBMIT
  =========================== */
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    let presupuestoIdNuevo = presupuestoId;

    // Crear o actualizar presupuesto
    if (isEdit && presupuestoId) {
      await axios.put(`http://localhost:3001/presupuestos/${presupuestoId}`, formData);
    } else {
      const presupuestoResp = await axios.post("http://localhost:3001/presupuestos", formData);
      presupuestoIdNuevo = presupuestoResp.data.id || presupuestoResp.data.insertId;
    }

    // Guardar items en detalle-presupuesto
    for (const item of items) {
      if (!item.articulo_id) continue;
      await axios.post("http://localhost:3001/presupuestodetalles", {
        presupuesto_id: presupuestoIdNuevo,
        articulo_id: item.articulo_id,
        cantidad: item.cantidad,
        ancho: item.ancho || null,
        alto: item.alto || null,
        precio_unitario: item.precio_unitario,
      });
    }

    navigate("/adminPanel/presupuestos");
  } catch (err) {
    console.error(err);
    alert("Error guardando presupuesto");
  }
};



  /* ===========================
     ACORDEÓN
  =========================== */
  const toggleAccordion = () => {
    document.getElementById("cliente-content")?.classList.toggle("hidden");
  };

  const clienteFields: { label: string; name: keyof typeof cliente }[] = [
    { label: "Nombre", name: "nombre" },
    { label: "Primer Apellido", name: "apellido1" },
    { label: "Segundo Apellido", name: "apellido2" },
    { label: "Calle", name: "calle" },
    { label: "Población", name: "poblacion" },
    { label: "Provincia", name: "provincia" },
    { label: "Código Postal", name: "codigo_postal" },
    { label: "País", name: "pais" },
    { label: "Teléfono", name: "telefono" },
    { label: "Email", name: "correo_electronico" },
  ];

  /* ===========================
     JSX
  =========================== */
  return (
    <form onSubmit={handleSubmit} className=" p-6 rounded shadow-md container w-full mt-1 border border-orange-500">
      <h2 className="text-xl font-bold mb-4  text-gray-700 dark:text-gray-200">{isEdit ? "Editar presupuesto" : "Nuevo presupuesto"}</h2>

      {/* CLIENTE */}
      <button
        type="button"
        onClick={() => setClienteModalOpen(true)}
        className="w-full mb-4 border p-2 rounded text-left border-orange-500"
      >
        {formData.cliente_id ? `Cliente ID: ${formData.cliente_id}` : "Seleccionar cliente"}
      </button>

      {/* ACORDEÓN DATOS CLIENTE */}
      <div className="border border-orange-400 rounded mb-4">
        <div className="bg-orange-400 p-2 cursor-pointer flex justify-between items-center" onClick={toggleAccordion}>
          <span className="font-bold">Datos del cliente</span>
          <span>▼</span>
        </div>

        <div id="cliente-content" className="p-4 hidden">
          {clienteFields.map((field) => (
            <div key={field.name} className="mb-2">
              <label className="block text-sm font-bold text-gray-700">{field.label}</label>
              <input
                type="text"
                value={cliente[field.name]}
                disabled={!isClienteEditable}
                onChange={(e) => {
                  const value = e.target.value;
                  setCliente((c) => ({ ...c, [field.name]: value }));
                  setFormData((f) => ({ ...f, [field.name]: value }));
                }}
                className={`w-full px-2 py-1 rounded border ${
                  isClienteEditable ? "border-orange-500" : "border-gray-300 bg-gray-100"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ARTÍCULOS */}
      <h3 className="font-bold mb-2 ">Artículos</h3>
      {items.map((item, index) => (
        <div key={index} className=" border-orange-500 p-3 rounded mb-2 border-2">
          <input
            type="text"
            value={item.descripcion}
            placeholder="Selecciona un artículo"
            readOnly
            onClick={() => {
              setSelectedArticuloIndex(index);
              setArticuloModalOpen(true);
            }}
            className="w-full mb-1 border p-2 cursor-pointer border-orange-500 "
            required
          />
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={item.cantidad}
              onChange={(e) => handleArticuloChange(index, "cantidad", Number(e.target.value))}
              className="w-1/2 border p-2 rounded border-orange-500"
            />
            <input
              type="number"
              step="0.01"
              value={item.precio_unitario}
              onChange={(e) => handleArticuloChange(index, "precio_unitario", Number(e.target.value))}
              className="w-1/2 border p-2 rounded border-orange-500"
            />
          </div>
          {items.length > 1 && (
            <button type="button" onClick={() => removeItem(index)} className="text-red-500 text-sm mt-1">
              Eliminar
            </button>
          )}
        </div>
      ))}

      <button type="button" onClick={addArticulo} className="bg-orange-500 text-white px-4 py-2 rounded mb-4">
        Añadir artículo
      </button>

      {/* TOTALES */}
      <div className="font-bold mb-4">
        Subtotal: {formData.subtotal.toFixed(2)} € <br />
        IVA: {formData.iva.toFixed(2)} € <br />
        Total: {formData.total.toFixed(2)} €
      </div>

      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">
        Guardar presupuesto
      </button>

      {/* MODALES */}
      <ClienteModal
        isOpen={isClienteModalOpen}
        onClose={() => setClienteModalOpen(false)}
        onSelect={(id) => {
          setFormData((f) => ({ ...f, cliente_id: id }));

          if (id === "99999") {
            setCliente({
              nombre: "",
              apellido1: "",
              apellido2: "",
              poblacion: "",
              provincia: "",
              calle: "",
              codigo_postal: "",
              pais: "",
              telefono: "",
              correo_electronico: "",
              dni: "",
            });
            return;
          }

          const selected = clientes.find((c) => String(c.id) === id);
          if (selected) {
            setCliente({ ...selected });
            setFormData((f) => ({ ...f, ...selected }));
          }
        }}
      />

      <ArticuloModal
        isOpen={isArticuloModalOpen}
        onClose={() => setArticuloModalOpen(false)}
        onSelect={(id) => {
          if (selectedArticuloIndex === null) return;

          const art = articulos.find((a) => String(a.id_articulo) === id);
          if (!art) return;

          const updatedItem: Item = {
            articulo_id: String(art.id_articulo),
            descripcion: `${art.modelo} - ${art.descripcion}`,
            cantidad: 1,
            precio_unitario: art.pvp_sin_iva || 0,
            ancho: art.ancho,
            alto: art.alto,
          };

          setItems((prev) => {
            const copy = [...prev];
            copy[selectedArticuloIndex] = updatedItem;

            const subtotal = copy.reduce((sum, i) => sum + i.cantidad * i.precio_unitario, 0);
            const iva = subtotal * 0.21;
            const total = subtotal + iva;
            setFormData((f) => ({ ...f, subtotal, iva, total }));

            return copy;
          });
        }}
      />
    </form>
  );
}
