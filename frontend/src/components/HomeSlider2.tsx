import { useEffect, useState } from "react";
import banner from "../assets/images/bgdoorhome.jpg";

// Puedes añadir más imágenes cuando quieras
const slides = [
  {
    image: banner,
    title: "Work with us",
    description: "Anim aute id magna aliqua ad ad non deserunt sunt.",
  },
  {
    image: banner,
    title: "Grow your business",
    description: "We help you scale your ideas to the next level.",
  },
  {
    image: banner,
    title: "Join our team",
    description: "Build amazing products with great people.",
  },
];

export function HomeSlider2() {
  const [current, setCurrent] = useState(0);

  // 🔁 Autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ⬅️ Flecha izquierda
  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // ➡️ Flecha derecha
  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative h-125 w-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Imagen */}
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />

          {/* Overlay oscuro */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Texto */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-4xl sm:text-6xl font-bold text-white">
              {slide.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg sm:text-xl text-gray-200">
              {slide.description}
            </p>
          </div>
        </div>
      ))}

      {/* ⬅️ Flecha izquierda */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition"
      >
        ❮
      </button>

      {/* ➡️ Flecha derecha */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition"
      >
        ❯
      </button>

      {/* 🔘 Indicadores */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-3 w-3 rounded-full transition ${
              index === current
                ? "bg-orange-400 scale-110"
                : "bg-white/50 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
