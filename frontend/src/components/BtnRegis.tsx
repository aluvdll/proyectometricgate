interface BtnRegisProps {
  texto: string;
}

export default function BtnRegis({ texto }: BtnRegisProps) {
  return (
    <a
      href="#"
      className="bg-orange-400 text-gray-900 hover:text-white px-4 py-2 rounded-md hover:bg-orange-500"
    >
      {texto}
    </a>
  );
}
