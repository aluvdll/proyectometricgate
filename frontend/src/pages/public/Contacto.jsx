import { useState } from "react";
import { NotificationModal } from "../../components/modals/NotificationModal";
import axios from "axios";

const CONTACT_API_URL =
  import.meta.env.VITE_CONTACT_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

function getAlternateHostUrl(url) {
  if (url.includes("127.0.0.1")) {
    return url.replace("127.0.0.1", "localhost");
  }

  if (url.includes("localhost")) {
    return url.replace("localhost", "127.0.0.1");
  }

  return null;
}

export function Contacto() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [notifyVisible, setNotifyVisible] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyType, setNotifyType] = useState("success");

  // Muestra el modal y lo cierra automaticamente tras unos segundos.
  const showNotification = (title, message, type = "success") => {
    setNotifyTitle(title);
    setNotifyMessage(message);
    setNotifyType(type);
    setNotifyVisible(true);
    setTimeout(() => setNotifyVisible(false), 3500);
  };

  // Mantiene sincronizados los campos del formulario con el estado local.
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  // Envia el formulario al backend y notifica el resultado con el modal global.
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const endpoint = `${CONTACT_API_URL}/api/contact/send-email`;

      try {
        await axios.post(endpoint, formData, {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        const isNetworkError = axios.isAxiosError(error) && !error.response;

        if (!isNetworkError) {
          throw error;
        }

        const alternateEndpoint = getAlternateHostUrl(endpoint);

        if (!alternateEndpoint) {
          throw error;
        }

        await axios.post(alternateEndpoint, formData, {
          headers: { "Content-Type": "application/json" },
        });
      }

      setFormData({ name: "", email: "", message: "" });
      showNotification(
        "Exito",
        "Mensaje enviado correctamente. Te responderemos lo antes posible.",
        "success",
      );
    } catch (err) {
      console.error(err);

      const backendMessage =
        axios.isAxiosError(err) && typeof err.response?.data?.error === "string"
          ? err.response.data.error
          : null;

      showNotification(
        "Error",
        backendMessage ||
          "No se pudo enviar el mensaje. Revisa la consola del servidor.",
        "error",
      );
    }
  }

  return (
    <>
      <section className="relative z-10 p-15 overflow-hidden py-12 sm:py-20 lg:py-30 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-300">
        <div className="container md-auto">
          <div className="mx-4 flex flex-wrap justify-center lg:justify-between">
            {/* <!-- Contact Form --> */}
            <div className="order-2 w-full px-4 lg:order-1 lg:w-1/2 xl:w-5/12">
              <div className="relative rounded-lg p-4 shadow-2xl sm:p-12 border-b-3 border-l-3 border-orange-400 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
                <form
                  className="rounded-xl bg-orange-400 dark:bg-gray-700 p-5 transition-colors duration-300"
                  id="contactForm"
                  onSubmit={handleSubmit}
                >
                  {/* <!-- Name --> */}
                  <div className="mb-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <i className="fas fa-user text-gray-500 dark:text-gray-400"></i>
                      </div>
                      <input
                        onChange={handleChange}
                        value={formData.name}
                        type="text"
                        name="name"
                        placeholder="Name"
                        className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* <!-- Email --> */}
                  <div className="mb-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <i className="fas fa-envelope text-gray-500 dark:text-gray-400"></i>
                      </div>
                      <input
                        onChange={handleChange}
                        value={formData.email}
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* <!-- Message --> */}
                  <div className="mb-6">
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <i className="fas fa-comment text-gray-500 dark:text-gray-400"></i>
                      </div>
                      <textarea
                        rows={6}
                        name="message"
                        placeholder="Message"
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      ></textarea>
                    </div>
                  </div>

                  {/* <!-- Submit --> */}
                  <div>
                    <button
                      type="submit"
                      className="w-full p-3 rounded-lg bg-orange-500! text-white hover:bg-orange-700!"
                    >
                      Enviar
                    </button>
                  </div>
                </form>

                {/* <!-- Decorative elements --> */}
                <div>
                  <span className="absolute -right-9 -top-10 z-[-1]">
                    <svg
                      width="100"
                      height="100"
                      viewBox="0 0 100 100"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0 100C0 44.7715 0 0 0 0C55.2285 0 100 44.7715 100 100C100 100 100 100 0 100Z"
                        className="fill-orange-500 dark:fill-orange-700"
                      />
                    </svg>
                  </span>
                  <span className="absolute -right-10 top-22.5 z-[-1]">
                    <svg
                      width="107"
                      height="134"
                      viewBox="0 0 107 134"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="104.999"
                        cy="132"
                        r="1.66667"
                        transform="rotate(180 104.999 132)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="117.333"
                        r="1.66667"
                        transform="rotate(180 104.999 117.333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="102.667"
                        r="1.66667"
                        transform="rotate(180 104.999 102.667)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="88"
                        r="1.66667"
                        transform="rotate(180 104.999 88)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="73.3333"
                        r="1.66667"
                        transform="rotate(180 104.999 73.3333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="45"
                        r="1.66667"
                        transform="rotate(180 104.999 45)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="16"
                        r="1.66667"
                        transform="rotate(180 104.999 16)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="59"
                        r="1.66667"
                        transform="rotate(180 104.999 59)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="30.6666"
                        r="1.66667"
                        transform="rotate(180 104.999 30.6666)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="1.66665"
                        r="1.66667"
                        transform="rotate(180 104.999 1.66665)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="132"
                        r="1.66667"
                        transform="rotate(180 90.3333 132)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="117.333"
                        r="1.66667"
                        transform="rotate(180 90.3333 117.333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="102.667"
                        r="1.66667"
                        transform="rotate(180 90.3333 102.667)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="88"
                        r="1.66667"
                        transform="rotate(180 90.3333 88)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="73.3333"
                        r="1.66667"
                        transform="rotate(180 90.3333 73.3333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="45"
                        r="1.66667"
                        transform="rotate(180 90.3333 45)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="16"
                        r="1.66667"
                        transform="rotate(180 90.3333 16)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="59"
                        r="1.66667"
                        transform="rotate(180 90.3333 59)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="30.6666"
                        r="1.66667"
                        transform="rotate(180 90.3333 30.6666)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="1.66665"
                        r="1.66667"
                        transform="rotate(180 90.3333 1.66665)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="132"
                        r="1.66667"
                        transform="rotate(180 75.6654 132)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="132"
                        r="1.66667"
                        transform="rotate(180 31.9993 132)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="117.333"
                        r="1.66667"
                        transform="rotate(180 75.6654 117.333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="117.333"
                        r="1.66667"
                        transform="rotate(180 31.9993 117.333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="102.667"
                        r="1.66667"
                        transform="rotate(180 75.6654 102.667)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="102.667"
                        r="1.66667"
                        transform="rotate(180 31.9993 102.667)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="88"
                        r="1.66667"
                        transform="rotate(180 75.6654 88)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="88"
                        r="1.66667"
                        transform="rotate(180 31.9993 88)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="73.3333"
                        r="1.66667"
                        transform="rotate(180 75.6654 73.3333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="73.3333"
                        r="1.66667"
                        transform="rotate(180 31.9993 73.3333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="45"
                        r="1.66667"
                        transform="rotate(180 75.6654 45)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="45"
                        r="1.66667"
                        transform="rotate(180 31.9993 45)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="16"
                        r="1.66667"
                        transform="rotate(180 75.6654 16)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="16"
                        r="1.66667"
                        transform="rotate(180 31.9993 16)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="59"
                        r="1.66667"
                        transform="rotate(180 75.6654 59)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="59"
                        r="1.66667"
                        transform="rotate(180 31.9993 59)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="30.6666"
                        r="1.66667"
                        transform="rotate(180 75.6654 30.6666)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="30.6666"
                        r="1.66667"
                        transform="rotate(180 31.9993 30.6666)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="1.66665"
                        r="1.66667"
                        transform="rotate(180 75.6654 1.66665)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="1.66665"
                        r="1.66667"
                        transform="rotate(180 31.9993 1.66665)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="132"
                        r="1.66667"
                        transform="rotate(180 60.9993 132)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="132"
                        r="1.66667"
                        transform="rotate(180 17.3333 132)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="117.333"
                        r="1.66667"
                        transform="rotate(180 60.9993 117.333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="117.333"
                        r="1.66667"
                        transform="rotate(180 17.3333 117.333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="102.667"
                        r="1.66667"
                        transform="rotate(180 60.9993 102.667)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="102.667"
                        r="1.66667"
                        transform="rotate(180 17.3333 102.667)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="88"
                        r="1.66667"
                        transform="rotate(180 60.9993 88)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="88"
                        r="1.66667"
                        transform="rotate(180 17.3333 88)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="73.3333"
                        r="1.66667"
                        transform="rotate(180 60.9993 73.3333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="73.3333"
                        r="1.66667"
                        transform="rotate(180 17.3333 73.3333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="45"
                        r="1.66667"
                        transform="rotate(180 60.9993 45)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="45"
                        r="1.66667"
                        transform="rotate(180 17.3333 45)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="16"
                        r="1.66667"
                        transform="rotate(180 60.9993 16)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="16"
                        r="1.66667"
                        transform="rotate(180 17.3333 16)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="59"
                        r="1.66667"
                        transform="rotate(180 60.9993 59)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="59"
                        r="1.66667"
                        transform="rotate(180 17.3333 59)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="30.6666"
                        r="1.66667"
                        transform="rotate(180 60.9993 30.6666)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="30.6666"
                        r="1.66667"
                        transform="rotate(180 17.3333 30.6666)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="1.66665"
                        r="1.66667"
                        transform="rotate(180 60.9993 1.66665)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="1.66665"
                        r="1.66667"
                        transform="rotate(180 17.3333 1.66665)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="132"
                        r="1.66667"
                        transform="rotate(180 46.3333 132)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="132"
                        r="1.66667"
                        transform="rotate(180 2.66536 132)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="117.333"
                        r="1.66667"
                        transform="rotate(180 46.3333 117.333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="117.333"
                        r="1.66667"
                        transform="rotate(180 2.66536 117.333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="102.667"
                        r="1.66667"
                        transform="rotate(180 46.3333 102.667)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="102.667"
                        r="1.66667"
                        transform="rotate(180 2.66536 102.667)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="88"
                        r="1.66667"
                        transform="rotate(180 46.3333 88)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="88"
                        r="1.66667"
                        transform="rotate(180 2.66536 88)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="73.3333"
                        r="1.66667"
                        transform="rotate(180 46.3333 73.3333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="73.3333"
                        r="1.66667"
                        transform="rotate(180 2.66536 73.3333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="45"
                        r="1.66667"
                        transform="rotate(180 46.3333 45)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="45"
                        r="1.66667"
                        transform="rotate(180 2.66536 45)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="16"
                        r="1.66667"
                        transform="rotate(180 46.3333 16)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="16"
                        r="1.66667"
                        transform="rotate(180 2.66536 16)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="59"
                        r="1.66667"
                        transform="rotate(180 46.3333 59)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="59"
                        r="1.66667"
                        transform="rotate(180 2.66536 59)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="30.6666"
                        r="1.66667"
                        transform="rotate(180 46.3333 30.6666)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="30.6666"
                        r="1.66667"
                        transform="rotate(180 2.66536 30.6666)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="1.66665"
                        r="1.66667"
                        transform="rotate(180 46.3333 1.66665)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="1.66665"
                        r="1.66667"
                        transform="rotate(180 2.66536 1.66665)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                    </svg>
                  </span>
                  <span className="absolute -bottom-7 -left-7 z-[-1]">
                    <svg
                      width="107"
                      height="134"
                      viewBox="0 0 107 134"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="104.999"
                        cy="132"
                        r="1.66667"
                        transform="rotate(180 104.999 132)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="117.333"
                        r="1.66667"
                        transform="rotate(180 104.999 117.333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="102.667"
                        r="1.66667"
                        transform="rotate(180 104.999 102.667)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="88"
                        r="1.66667"
                        transform="rotate(180 104.999 88)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="73.3333"
                        r="1.66667"
                        transform="rotate(180 104.999 73.3333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="45"
                        r="1.66667"
                        transform="rotate(180 104.999 45)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="16"
                        r="1.66667"
                        transform="rotate(180 104.999 16)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="59"
                        r="1.66667"
                        transform="rotate(180 104.999 59)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="30.6666"
                        r="1.66667"
                        transform="rotate(180 104.999 30.6666)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="104.999"
                        cy="1.66665"
                        r="1.66667"
                        transform="rotate(180 104.999 1.66665)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="132"
                        r="1.66667"
                        transform="rotate(180 90.3333 132)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="117.333"
                        r="1.66667"
                        transform="rotate(180 90.3333 117.333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="102.667"
                        r="1.66667"
                        transform="rotate(180 90.3333 102.667)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="88"
                        r="1.66667"
                        transform="rotate(180 90.3333 88)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="73.3333"
                        r="1.66667"
                        transform="rotate(180 90.3333 73.3333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="45"
                        r="1.66667"
                        transform="rotate(180 90.3333 45)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="16"
                        r="1.66667"
                        transform="rotate(180 90.3333 16)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="59"
                        r="1.66667"
                        transform="rotate(180 90.3333 59)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="30.6666"
                        r="1.66667"
                        transform="rotate(180 90.3333 30.6666)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="90.3333"
                        cy="1.66665"
                        r="1.66667"
                        transform="rotate(180 90.3333 1.66665)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="132"
                        r="1.66667"
                        transform="rotate(180 75.6654 132)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="132"
                        r="1.66667"
                        transform="rotate(180 31.9993 132)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="117.333"
                        r="1.66667"
                        transform="rotate(180 75.6654 117.333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="117.333"
                        r="1.66667"
                        transform="rotate(180 31.9993 117.333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="102.667"
                        r="1.66667"
                        transform="rotate(180 75.6654 102.667)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="102.667"
                        r="1.66667"
                        transform="rotate(180 31.9993 102.667)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="88"
                        r="1.66667"
                        transform="rotate(180 75.6654 88)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="88"
                        r="1.66667"
                        transform="rotate(180 31.9993 88)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="73.3333"
                        r="1.66667"
                        transform="rotate(180 75.6654 73.3333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="73.3333"
                        r="1.66667"
                        transform="rotate(180 31.9993 73.3333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="45"
                        r="1.66667"
                        transform="rotate(180 75.6654 45)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="45"
                        r="1.66667"
                        transform="rotate(180 31.9993 45)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="16"
                        r="1.66667"
                        transform="rotate(180 75.6654 16)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="16"
                        r="1.66667"
                        transform="rotate(180 31.9993 16)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="59"
                        r="1.66667"
                        transform="rotate(180 75.6654 59)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="59"
                        r="1.66667"
                        transform="rotate(180 31.9993 59)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="30.6666"
                        r="1.66667"
                        transform="rotate(180 75.6654 30.6666)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="30.6666"
                        r="1.66667"
                        transform="rotate(180 31.9993 30.6666)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="75.6654"
                        cy="1.66665"
                        r="1.66667"
                        transform="rotate(180 75.6654 1.66665)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="31.9993"
                        cy="1.66665"
                        r="1.66667"
                        transform="rotate(180 31.9993 1.66665)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="132"
                        r="1.66667"
                        transform="rotate(180 60.9993 132)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="132"
                        r="1.66667"
                        transform="rotate(180 17.3333 132)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="117.333"
                        r="1.66667"
                        transform="rotate(180 60.9993 117.333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="117.333"
                        r="1.66667"
                        transform="rotate(180 17.3333 117.333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="102.667"
                        r="1.66667"
                        transform="rotate(180 60.9993 102.667)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="102.667"
                        r="1.66667"
                        transform="rotate(180 17.3333 102.667)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="88"
                        r="1.66667"
                        transform="rotate(180 60.9993 88)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="88"
                        r="1.66667"
                        transform="rotate(180 17.3333 88)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="73.3333"
                        r="1.66667"
                        transform="rotate(180 60.9993 73.3333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="73.3333"
                        r="1.66667"
                        transform="rotate(180 17.3333 73.3333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="45"
                        r="1.66667"
                        transform="rotate(180 60.9993 45)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="45"
                        r="1.66667"
                        transform="rotate(180 17.3333 45)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="16"
                        r="1.66667"
                        transform="rotate(180 60.9993 16)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="16"
                        r="1.66667"
                        transform="rotate(180 17.3333 16)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="59"
                        r="1.66667"
                        transform="rotate(180 60.9993 59)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="59"
                        r="1.66667"
                        transform="rotate(180 17.3333 59)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="30.6666"
                        r="1.66667"
                        transform="rotate(180 60.9993 30.6666)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="30.6666"
                        r="1.66667"
                        transform="rotate(180 17.3333 30.6666)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="60.9993"
                        cy="1.66665"
                        r="1.66667"
                        transform="rotate(180 60.9993 1.66665)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="17.3333"
                        cy="1.66665"
                        r="1.66667"
                        transform="rotate(180 17.3333 1.66665)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="132"
                        r="1.66667"
                        transform="rotate(180 46.3333 132)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="132"
                        r="1.66667"
                        transform="rotate(180 2.66536 132)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="117.333"
                        r="1.66667"
                        transform="rotate(180 46.3333 117.333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="117.333"
                        r="1.66667"
                        transform="rotate(180 2.66536 117.333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="102.667"
                        r="1.66667"
                        transform="rotate(180 46.3333 102.667)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="102.667"
                        r="1.66667"
                        transform="rotate(180 2.66536 102.667)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="88"
                        r="1.66667"
                        transform="rotate(180 46.3333 88)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="88"
                        r="1.66667"
                        transform="rotate(180 2.66536 88)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="73.3333"
                        r="1.66667"
                        transform="rotate(180 46.3333 73.3333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="73.3333"
                        r="1.66667"
                        transform="rotate(180 2.66536 73.3333)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="45"
                        r="1.66667"
                        transform="rotate(180 46.3333 45)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="45"
                        r="1.66667"
                        transform="rotate(180 2.66536 45)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="16"
                        r="1.66667"
                        transform="rotate(180 46.3333 16)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="16"
                        r="1.66667"
                        transform="rotate(180 2.66536 16)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="59"
                        r="1.66667"
                        transform="rotate(180 46.3333 59)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="59"
                        r="1.66667"
                        transform="rotate(180 2.66536 59)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="30.6666"
                        r="1.66667"
                        transform="rotate(180 46.3333 30.6666)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="30.6666"
                        r="1.66667"
                        transform="rotate(180 2.66536 30.6666)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="46.3333"
                        cy="1.66665"
                        r="1.66667"
                        transform="rotate(180 46.3333 1.66665)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                      <circle
                        cx="2.66536"
                        cy="1.66665"
                        r="1.66667"
                        transform="rotate(180 2.66536 1.66665)"
                        className="fill-orange-500 dark:fill-orange-700"
                      ></circle>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
            {/* ****************************************************************** */}
            {/* BLOQUE IZQUIERDO */}
            {/* ****************************************************************** */}
            {/* <!-- Contact Information --> */}
            <div className="order-1 w-full px-4 lg:order-2 lg:w-1/2 xl:w-6/12">
              <div className="mb-12 px-5 pt-3 sm:max-w-142.5 lg:mb-0">
                <span className="mb-4 block text-base font-bold text-orange-500">
                  CONTACTO
                </span>
                <h2 className="mb-6 text-[32px] font-bold  sm:text-[40px] lg:text-[36px] xl:text-[40px]">
                  Contacta con
                  <span className="block"></span>
                  <span className="text-orange-500">M</span>etric
                  <span className="text-orange-500">G</span>ates
                </h2>
                <p className="text-base leading-relaxed">
                  Si tiene alguna pregunta o comentario, póngase en contacto con
                  nosotros.
                </p>
                <p className="mb-9 text-base leading-relaxed">
                  Estamos aquí para ayudarte y responder a cualquier pregunta
                  que tengas. Esperamos tener noticias tuyas.
                </p>

                {/* <!-- Phone --> */}
                <div className="mb-8 flex w-full max-w-85.3 gap-3">
                  <div
                    className="mr-6 flex h-10 w-full max-w-10 items-center justify-center  rounded-sm 
              bg-orange-500 dark:bg-orange-400 text-orange-500 dark:text-orange-400 sm:h-17.5 sm:max-w-17."
                  >
                    <i className="fas fa-phone text-xl"></i>
                  </div>
                  <div className="w-full">
                    <h4 className="mb-1 text-base sm:text-xl font-bold">
                      Número de teléfono
                    </h4>
                    <p className="text-xs sm:text-base">+34 637 14 10 76</p>
                  </div>
                </div>

                {/* <!-- Email --> */}
                <div className="mb-8 flex w-full max-w-82.5 gap-3">
                  <div className="mr-6 flex h-10 w-full max-w-10 items-center justify-center  rounded-sm bg-orange-500 dark:bg-orange-400 text-orange-500 dark:text-orange-400 sm:h-14.5 sm:max-w-7.5">
                    <i className="fas fa-envelope text-xl"></i>
                  </div>
                  <div className="w-full">
                    <h4 className="mb-1 text-base sm:text-xl font-bold">
                      Correo electrónico:
                    </h4>
                    <p className="text-xs sm:text-base">metricgate@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {notifyVisible && (
        <NotificationModal
          title={notifyTitle}
          message={notifyMessage}
          type={notifyType}
        />
      )}
    </>
  );
}
