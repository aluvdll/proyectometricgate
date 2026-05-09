import { useState, useEffect } from "react";
import axios from "axios";
import type { Cliente } from "../types/Cliente";

export function ClienteModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (clienteId: string) => void;
}) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      axios
        .get("http://localhost:3001/clientes")
        .then((res) => setClientes(res.data))
        .catch(() => alert("Error cargando clientes"));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filtrado simple por nombre/apellidos
  const filtered = clientes.filter((c) =>
    `${c.nombre} ${c.apellido1} ${c.apellido2} ${c.calle} ${c.poblacion} ${c.provincia} ${c.codigo_postal} ${c.telefono} ${c.correo_electronico} ${c.pais}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 bg-orange-500 bg-opacity-90 flex justify-center items-center">
      <div className=" p-6 rounded w-96  overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Selecciona un cliente</h2>

        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded-md border-gray-300"
        />

        <div className="fixed inset-0 bg-orange-500  flex justify-center items-center z-50">
          <div className="bg-white dark:text-gray-900 p-6 rounded-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between row-auto">
              <h2 className="text-lg font-bold mb-4">Selecciona un cliente</h2>
              <button
                onClick={onClose}
                className="w-20 bg-red-500 text-white  rounded-md mb-4"
              >
                Cancelar
              </button>
            </div>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full mb-3 px-3 py-2 border rounded-md border-gray-300"
            />

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">ID</th>
                  <th className="border px-2 py-1">Nombre</th>
                  <th className="border px-2 py-1">Apellidos</th>
                  <th className="border px-2 py-1">Calle</th>
                  <th className="border px-2 py-1">Población</th>
                  <th className="border px-2 py-1">Provincia</th>
                  <th className="border px-2 py-1">CP</th>
                  <th className="border px-2 py-1">Teléfono</th>
                  <th className="border px-2 py-1">Email</th>
                  <th className="border px-2 py-1">País</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-200 cursor-pointer"
                    onClick={() => {
                      onSelect(String(c.id));
                      onClose();
                    }}
                  >
                    <td className="border px-2 py-1">{c.id}</td>
                    <td className="border px-2 py-1">{c.nombre}</td>
                    <td className="border px-2 py-1">
                      {c.apellido1} {c.apellido2}
                    </td>
                    <td className="border px-2 py-1">{c.calle}</td>
                    <td className="border px-2 py-1">{c.poblacion}</td>
                    <td className="border px-2 py-1">{c.provincia}</td>
                    <td className="border px-2 py-1">{c.codigo_postal}</td>
                    <td className="border px-2 py-1">{c.telefono}</td>
                    <td className="border px-2 py-1">{c.correo_electronico}</td>
                    <td className="border px-2 py-1">{c.pais}</td>
                  </tr>
                ))}

                <tr
                  className="hover:bg-gray-200 cursor-pointer font-semibold"
                  onClick={() => {
                    onSelect("99999"); // Cliente genérico
                    onClose();
                  }}
                >
                  <td className="border px-2 py-1" colSpan={10}>
                    Cliente Genérico (99999)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-500 text-white py-2 rounded-md"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
