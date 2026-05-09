import { useState, useEffect } from "react";
import banner from "../assets/images/bgdoorhome.jpg";

// Puedes agregar más imágenes aquí
const images = [
  banner,
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
];

export function HomeSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000); // cambia cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] overflow-hidden">
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`Slide ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Texto opcional sobre el slider */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
        <h1 className="text-4xl sm:text-6xl font-bold text-white">
          Work with us
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-200 max-w-2xl">
          Anim aute id magna aliqua ad ad non deserunt sunt.
        </p>
      </div>
    </div>
  );
}
