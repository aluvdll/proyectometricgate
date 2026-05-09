export function MenuDescktop() {
  return (
    <div className="hidden md:flex ml-10 space-x-8">
      <a href="/" className="text-gray-900 hover:text-orange-500">
        Inicio
      </a>
      {/* <a href="#" className="text-gray-900 hover:text-orange-500">
        Demo
      </a> */}
      <a href="/tarifas" className="text-gray-900 hover:text-orange-500">
        Tarifas
      </a>
      <a href="/contacto" className="text-gray-900 hover:text-orange-500">
        Contacto
      </a>
    </div>
  );
}
