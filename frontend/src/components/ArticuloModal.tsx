import { useState, useEffect } from "react";
import axios from "axios";
import type { Articulo } from "../types/Articulo";

export function ArticuloModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (articuloId: string) => void;
}) {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      axios
        .get("http://localhost:3001/articulos")
        .then((res) => setArticulos(res.data))
        .catch(() => alert("Error cargando artículos"));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = articulos.filter((art) =>
    `${art.modelo} ${art.descripcion} ${art.medida} ${art.color}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white text-gray-900 p-6 rounded-lg w-full max-w-5xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Selecciona un artículo</h2>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-1 rounded-md"
          >
            Cancelar
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar artículo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded-md"
        />

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-orange-400">
              <th className="border px-2 py-1">Modelo</th>
              <th className="border px-2 py-1">Descripción</th>
              <th className="border px-2 py-1">€ S/IVA.</th>
              <th className="border px-2 py-1">Color</th>
              <th className="border px-2 py-1">Foto</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((art) => (
              <tr
                key={art.id_articulo}
                className="hover:bg-gray-200 cursor-pointer"
                onClick={() => {
                  onSelect(String(art.id_articulo));
                  onClose();
                }}
              >
                <td className="border px-2 py-5">{art.modelo}</td>
                <td className="border px-2 py-5">{art.descripcion}</td>
                <td className="border px-2 py-5">{art.pvp_sin_iva}</td>
                <td className="border px-2 py-5">{art.color}</td>
                <td className="border p-2 w-80 h-34 align-middle text-center">
                  <img 
                    src={`http://localhost:3001/uploads/articulos/${art.imagen}`}
                    alt={art.modelo}
                    className="w-full h-full object-contain"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
