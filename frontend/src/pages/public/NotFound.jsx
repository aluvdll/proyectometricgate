import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo404sf.png";

export const Notfound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <>
      <style>
        @import
        url(https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/5.3.45/css/materialdesignicons.min.css);
      </style>
      <div className="min-w-screen min-h-screen bg-blue-100 flex items-center p-5 lg:p-20 overflow-hidden relative">
        <div className="flex-1 min-h-full min-w-full rounded-3xl shadow-xl p-10 lg:p-20 text-gray-800 relative md:flex items-center text-center md:text-left">
          <div className="w-full md:w-2/3">
            <div className="mb-10 md:mb-20 text-gray-600 font-light">
              <h1 className="font-black uppercase text-3xl lg:text-5xl text-orange-500 mb-10">
                Lo sentimos mucho, esta página no se encuentra.
              </h1>
              <p>Algo ha ido mal, no te preocupes vamos a solucionarlo.</p>
              <p>Intenta buscar de nuevo o usa el botón Volver atrás abajo.</p>
            </div>
            <div className="mb-20 md:mb-0">
              <button
                onClick={handleGoBack}
                className="text-lg font-light outline-none focus:outline-none transform transition-all hover:scale-110 text-yellow-500 hover:text-yellow-600"
              >
                <i className="mdi mdi-arrow-left mr-2"></i>
              </button>
            </div>
          </div>
          <div className="w-full md:w-1/2 text-center">
            <img src={logo} alt="logo" />
          </div>
        </div>
        <div className="w-64 md:w-96 h-96 md:h-full bg-blue-200 bg-opacity-30 absolute -top-64 md:-top-96 right-20 md:right-32 rounded-full pointer-events-none -rotate-45 transform"></div>
        <div className="w-96 h-full bg-yellow-200 bg-opacity-20 absolute -bottom-96 right-64 rounded-full pointer-events-none -rotate-45 transform"></div>
      </div>
    </>
  );
};

export default Notfound;
